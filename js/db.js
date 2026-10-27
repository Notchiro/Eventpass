/**
 * EventPass Relational Database Engine (Supabase / PostgreSQL)
 *
 * Data now lives in a shared Supabase Postgres database, so accounts and events
 * created on one device are visible on every other device.
 *
 * How it works (so the rest of the app can stay synchronous):
 *  - On startup every table is downloaded into an in-memory cache  -> `db.ready`
 *  - All reads (getAllUsers, getEventById, ...) read from that cache
 *  - All writes update the cache immediately and are saved to Supabase in the
 *    background, in order (write-through)
 *
 * Tables: users, events, registrations, attendance, certificates, activity_logs
 * (create them by running supabase-setup.sql in the Supabase SQL Editor)
 */

const EVENTPASS_SUPABASE_URL = 'https://tceldolmvabqqciiflyr.supabase.co';
// Publishable (anon) key: safe to ship in front-end code. NEVER put the secret / service_role key here.
const EVENTPASS_SUPABASE_KEY = 'sb_publishable_yrVpp9mJDBcnEMMyx9NXmQ_C43it8af';

class EventPassDB {
  constructor() {
    this.tableNames = ['users', 'events', 'registrations', 'attendance', 'certificates', 'activity_logs'];
    this.tables = {};
    this.snapshots = {};
    this.tableNames.forEach(t => { this.tables[t] = []; this.snapshots[t] = new Map(); });
    this.queue = Promise.resolve();
    this.client = null;
    this.ready = this.load();
    // Avoid an "unhandled rejection" warning; callers handle errors via `await db.ready`.
    this.ready.catch(() => {});
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.refresh().catch(() => {});
    });
  }

  // --------------------------------------------------------------------------
  // CONNECTION / LOADING
  // --------------------------------------------------------------------------
  async load() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Could not load the Supabase library. Check your internet connection and reload.');
    }
    this.client = window.supabase.createClient(EVENTPASS_SUPABASE_URL, EVENTPASS_SUPABASE_KEY);
    await this.fetchAll();
  }

  async fetchAll() {
    const results = await Promise.all(this.tableNames.map(t => {
      let q = this.client.from(t).select('*');
      if (t === 'activity_logs') q = q.order('timestamp', { ascending: false }).order('id', { ascending: false }).limit(100);
      else if (t === 'events') q = q.order('created_at', { ascending: false });
      else q = q.order('id', { ascending: true });
      return q;
    }));
    results.forEach((res, i) => {
      const t = this.tableNames[i];
      if (res.error) {
        throw new Error(`Database error while loading "${t}": ${res.error.message}. Did you run supabase-setup.sql?`);
      }
      this.tables[t] = res.data || [];
      this.rebuildSnapshot(t);
    });
  }

  // Re-download everything (called when the tab becomes visible again) once pending writes are done.
  async refresh() {
    if (!this.client) return;
    await this.queue;
    await this.fetchAll();
  }

  rebuildSnapshot(t) {
    const snap = new Map();
    this.tables[t].forEach(row => snap.set(String(row.id), JSON.stringify(row)));
    this.snapshots[t] = snap;
  }

  // --------------------------------------------------------------------------
  // PASSWORD HASHING (never store plain-text passwords)
  // --------------------------------------------------------------------------
  async hashPassword(plain) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Secure hashing is unavailable. Open the site over https:// to continue.');
    }
    const data = new TextEncoder().encode('eventpass:' + plain);
    const buf = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // --------------------------------------------------------------------------
  // Generic Table Get / Set (cache + write-through to Supabase)
  // --------------------------------------------------------------------------
  getTable(tableName) {
    return this.tables[tableName] || [];
  }

  setTable(tableName, data) {
    this.tables[tableName] = data;
    if (tableName === 'activity_logs') return; // logs are inserted by logActivity()

    const snap = this.snapshots[tableName];
    const next = new Map();
    const upserts = [];
    data.forEach(row => {
      const key = String(row.id);
      const json = JSON.stringify(row);
      next.set(key, json);
      if (snap.get(key) !== json) upserts.push(JSON.parse(json));
    });
    const deletes = [];
    snap.forEach((_, key) => { if (!next.has(key)) deletes.push(key); });
    this.snapshots[tableName] = next;

    if (!upserts.length && !deletes.length) return;
    this.enqueue(async () => {
      if (upserts.length) {
        const { error } = await this.client.from(tableName).upsert(upserts);
        if (error) throw error;
      }
      if (deletes.length) {
        const { error } = await this.client.from(tableName).delete().in('id', deletes);
        if (error) throw error;
      }
    }, tableName);
  }

  enqueue(job, label) {
    this.queue = this.queue.then(job).catch(err => {
      console.error(`Failed to save to Supabase (${label}):`, err);
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('Could not save to the database: ' + (err.message || err), 'error');
      }
    });
    return this.queue;
  }

  // Random numeric suffix used in ticket / attendance / certificate ids
  randId() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // --------------------------------------------------------------------------
  // USER METHODS
  // --------------------------------------------------------------------------
  getAllUsers() {
    return this.getTable('users') || [];
  }

  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  getUserByEmail(email) {
    if (!email) return null;
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  createUser(userData) {
    const users = this.getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    if (!/^[0-9a-f]{64}$/.test(userData.password || '')) {
      throw new Error('Password must be hashed with db.hashPassword() before saving.');
    }

    const newUser = {
      id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      full_name: userData.full_name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      role: userData.role || 'participant',
      organization: userData.organization || 'General Campus',
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users.push(newUser);
    this.setTable('users', users);
    this.logActivity(newUser.email, 'USER_REGISTERED', `New ${newUser.role} account created for ${newUser.full_name}`);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found.');

    users[idx] = { ...users[idx], ...updates };
    this.setTable('users', users);
    return users[idx];
  }

  deleteUser(id) {
    let users = this.getAllUsers();
    const target = users.find(u => u.id === id);
    if (!target) return false;

    users = users.filter(u => u.id !== id);
    this.setTable('users', users);
    this.logActivity('admin@eventpass.edu', 'USER_DELETED', `Deleted user account: ${target.email}`);
    return true;
  }

  // --------------------------------------------------------------------------
  // EVENT METHODS
  // --------------------------------------------------------------------------
  getAllEvents() {
    return this.getTable('events') || [];
  }

  getEventById(id) {
    const events = this.getAllEvents();
    return events.find(e => e.id === id) || null;
  }

  getEventsByOrganizer(organizerId) {
    const events = this.getAllEvents();
    return events.filter(e => e.organizer_id === organizerId);
  }

  createEvent(eventData, organizerUser) {
    const events = this.getAllEvents();
    const newEvent = {
      id: 'evt-' + Date.now().toString(36),
      organizer_id: organizerUser.id,
      organizer_name: organizerUser.full_name,
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      category: eventData.category || 'Seminar',
      date: eventData.date,
      start_time: eventData.start_time || '09:00 AM',
      end_time: eventData.end_time || '04:00 PM',
      venue: eventData.venue.trim(),
      capacity: parseInt(eventData.capacity, 10) || 100,
      banner: eventData.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
      certificate_template: eventData.certificate_template || 'classic-gold',
      status: 'upcoming',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    events.unshift(newEvent);
    this.setTable('events', events);
    this.logActivity(organizerUser.email, 'CREATE_EVENT', `Created new event: "${newEvent.title}"`);
    return newEvent;
  }

  updateEvent(id, updates) {
    const events = this.getAllEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found.');

    events[idx] = { ...events[idx], ...updates };
    this.setTable('events', events);
    return events[idx];
  }

  deleteEvent(id) {
    let events = this.getAllEvents();
    const target = events.find(e => e.id === id);
    if (!target) return false;

    events = events.filter(e => e.id !== id);
    this.setTable('events', events);

    // Cascade delete registrations, attendance, certificates
    let registrations = this.getTable('registrations') || [];
    registrations = registrations.filter(r => r.event_id !== id);
    this.setTable('registrations', registrations);

    let attendance = this.getTable('attendance') || [];
    attendance = attendance.filter(a => a.event_id !== id);
    this.setTable('attendance', attendance);

    let certificates = this.getTable('certificates') || [];
    certificates = certificates.filter(c => c.event_id !== id);
    this.setTable('certificates', certificates);

    this.logActivity('system', 'DELETE_EVENT', `Deleted event "${target.title}" and its linked records.`);
    return true;
  }

  // --------------------------------------------------------------------------
  // REGISTRATION & QR PASS METHODS
  // --------------------------------------------------------------------------
  getAllRegistrations() {
    return this.getTable('registrations') || [];
  }

  getRegistrationsForEvent(eventId) {
    const registrations = this.getAllRegistrations();
    return registrations.filter(r => r.event_id === eventId);
  }

  getRegistrationsForParticipant(participantId) {
    const registrations = this.getAllRegistrations();
    return registrations.filter(r => r.participant_id === participantId);
  }

  isParticipantRegistered(eventId, participantId) {
    const registrations = this.getAllRegistrations();
    return registrations.some(r => r.event_id === eventId && r.participant_id === participantId);
  }

  registerParticipant(eventId, participantId) {
    const event = this.getEventById(eventId);
    if (!event) throw new Error('Event does not exist.');

    const participant = this.getUserById(participantId);
    if (!participant) throw new Error('User not found.');

    const registrations = this.getAllRegistrations();
    const alreadyRegistered = registrations.find(r => r.event_id === eventId && r.participant_id === participantId);
    if (alreadyRegistered) {
      throw new Error('You are already registered for this event!');
    }

    const currentCount = registrations.filter(r => r.event_id === eventId).length;
    if (currentCount >= event.capacity) {
      throw new Error('Registration closed: Event has reached maximum capacity.');
    }

    const regId = 'reg-' + this.randId();
    // Unique QR Code payload structure: EP-QR:[EVENT_ID]:[PARTICIPANT_ID]:[REG_ID]
    const qrPayload = `EP-QR:${eventId}:${participantId}:${regId}`;

    const newReg = {
      id: regId,
      event_id: eventId,
      participant_id: participantId,
      qr_code: qrPayload,
      registered_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'registered'
    };

    registrations.push(newReg);
    this.setTable('registrations', registrations);

    this.logActivity(participant.email, 'EVENT_REGISTRATION', `Registered for "${event.title}". Ticket: ${regId}`);
    return newReg;
  }

  // --------------------------------------------------------------------------
  // ATTENDANCE & QR SCANNING METHODS
  // --------------------------------------------------------------------------
  getAllAttendance() {
    return this.getTable('attendance') || [];
  }

  getAttendanceForEvent(eventId) {
    const attendance = this.getAllAttendance();
    return attendance.filter(a => a.event_id === eventId);
  }

  getAttendanceRecord(eventId, participantId) {
    const attendance = this.getAllAttendance();
    return attendance.find(a => a.event_id === eventId && a.participant_id === participantId) || null;
  }

  /**
   * Process and verify incoming QR Scan string:
   * Format: EP-QR:[EVENT_ID]:[PARTICIPANT_ID]:[REG_ID]
   */
  processQRScan(qrString, targetEventId, scannedByUserId) {
    if (!qrString || typeof qrString !== 'string') {
      return { success: false, code: 'INVALID_FORMAT', message: 'Invalid QR code data format.' };
    }

    const trimmed = qrString.trim();
    if (!trimmed.startsWith('EP-QR:')) {
      return { success: false, code: 'NOT_EVENTPASS_CODE', message: 'Unrecognized QR code. Not an official EventPass ticket.' };
    }

    const parts = trimmed.split(':');
    if (parts.length < 4) {
      return { success: false, code: 'CORRUPT_PAYLOAD', message: 'Incomplete or corrupted QR payload.' };
    }

    const eventId = parts[1];
    const participantId = parts[2];
    const regId = parts[3];

    // Check if QR belongs to the selected event
    if (targetEventId && eventId !== targetEventId) {
      const scannedEvent = this.getEventById(eventId);
      const targetEvent = this.getEventById(targetEventId);
      const scannedTitle = scannedEvent ? scannedEvent.title : 'Another Event';
      const targetTitle = targetEvent ? targetEvent.title : 'Selected Event';
      return {
        success: false,
        code: 'WRONG_EVENT',
        message: `Wrong Event Ticket! This pass belongs to "${scannedTitle}", but the gate is currently scanning for "${targetTitle}".`
      };
    }

    // Verify registration exists
    const registrations = this.getAllRegistrations();
    const reg = registrations.find(r => r.id === regId && r.event_id === eventId && r.participant_id === participantId);
    if (!reg) {
      return { success: false, code: 'REGISTRATION_NOT_FOUND', message: 'No valid registration found matching this QR code.' };
    }

    // Check for duplicate attendance
    const attendanceList = this.getAllAttendance();
    const existingAttendance = attendanceList.find(a => a.registration_id === regId);
    const participant = this.getUserById(participantId);
    const event = this.getEventById(eventId);

    if (existingAttendance) {
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `Already Checked In! ${participant ? participant.full_name : 'Attendee'} was already checked in at ${existingAttendance.check_in_time}.`,
        attendee: participant,
        event: event,
        checkInTime: existingAttendance.check_in_time
      };
    }

    // Record verified attendance
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newAttendance = {
      id: 'att-' + this.randId(),
      event_id: eventId,
      participant_id: participantId,
      registration_id: regId,
      check_in_time: nowTime,
      scanned_by: scannedByUserId || 'Gate Scanner',
      status: 'verified'
    };

    attendanceList.push(newAttendance);
    this.setTable('attendance', attendanceList);

    // Update registration status
    const regIdx = registrations.findIndex(r => r.id === regId);
    if (regIdx !== -1) {
      registrations[regIdx].status = 'attended';
      this.setTable('registrations', registrations);
    }

    // Automatically issue certificate record
    const certRecord = this.issueCertificate(eventId, participantId);

    // Log Activity
    const scannerUser = this.getUserById(scannedByUserId);
    this.logActivity(
      scannerUser ? scannerUser.email : 'gate-scanner',
      'ATTENDANCE_CONFIRMED',
      `Verified attendance for ${participant ? participant.full_name : participantId} at "${event ? event.title : eventId}".`
    );

    return {
      success: true,
      code: 'CONFIRMED',
      message: 'Attendance Confirmed!',
      attendee: participant,
      event: event,
      checkInTime: nowTime,
      regId: regId,
      certificateId: certRecord ? certRecord.certificate_id : null
    };
  }

  // Manual Check-in / Toggle by Organizer
  toggleManualAttendance(eventId, participantId, regId, organizerId) {
    const attendanceList = this.getAllAttendance();
    const existingIdx = attendanceList.findIndex(a => a.registration_id === regId);
    const registrations = this.getAllRegistrations();
    const regIdx = registrations.findIndex(r => r.id === regId);

    if (existingIdx !== -1) {
      // Mark as absent / remove attendance
      attendanceList.splice(existingIdx, 1);
      this.setTable('attendance', attendanceList);
      if (regIdx !== -1) {
        registrations[regIdx].status = 'registered';
        this.setTable('registrations', registrations);
      }
      return { status: 'registered', message: 'Attendance record removed.' };
    } else {
      // Mark as verified attended
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      attendanceList.push({
        id: 'att-' + this.randId(),
        event_id: eventId,
        participant_id: participantId,
        registration_id: regId,
        check_in_time: nowTime,
        scanned_by: organizerId || 'Manual Check-in',
        status: 'verified'
      });
      this.setTable('attendance', attendanceList);

      if (regIdx !== -1) {
        registrations[regIdx].status = 'attended';
        this.setTable('registrations', registrations);
      }

      this.issueCertificate(eventId, participantId);
      return { status: 'attended', check_in_time: nowTime, message: 'Attendance verified manually.' };
    }
  }

  // Reset all attendance for an event (convenient for presentation and defense testing)
  resetEventAttendance(eventId) {
    let attendance = this.getAllAttendance();
    attendance = attendance.filter(a => a.event_id !== eventId);
    this.setTable('attendance', attendance);

    let registrations = this.getAllRegistrations();
    registrations.forEach(r => {
      if (r.event_id === eventId) {
        r.status = 'registered';
      }
    });
    this.setTable('registrations', registrations);

    let certificates = this.getAllCertificates();
    certificates = certificates.filter(c => c.event_id !== eventId);
    this.setTable('certificates', certificates);

    const event = this.getEventById(eventId);
    this.logActivity('organizer@eventpass.edu', 'RESET_ATTENDANCE', `Reset attendance and certificates for "${event ? event.title : eventId}" to initial state.`);
    return true;
  }

  // --------------------------------------------------------------------------
  // CERTIFICATES METHODS
  // --------------------------------------------------------------------------
  getAllCertificates() {
    return this.getTable('certificates') || [];
  }

  getCertificate(eventId, participantId) {
    const certificates = this.getAllCertificates();
    return certificates.find(c => c.event_id === eventId && c.participant_id === participantId) || null;
  }

  issueCertificate(eventId, participantId) {
    let certificates = this.getAllCertificates();
    const existing = certificates.find(c => c.event_id === eventId && c.participant_id === participantId);
    if (existing) return existing;

    const certSerial = 'EP-CERT-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const newCert = {
      id: 'cert-' + this.randId(),
      event_id: eventId,
      participant_id: participantId,
      certificate_id: certSerial,
      issued_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      certificate_file: `EventPass-Certificate-${certSerial}.pdf`
    };

    certificates.push(newCert);
    this.setTable('certificates', certificates);
    return newCert;
  }

  // --------------------------------------------------------------------------
  // ACTIVITY LOGS & AUDITING
  // --------------------------------------------------------------------------
  getActivityLogs() {
    return this.getTable('activity_logs') || [];
  }

  logActivity(userEmail, action, details) {
    const entry = {
      user_email: userEmail,
      action: action,
      details: details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    // Local cache copy (temporary id; the real id is assigned by the database)
    const logs = this.getActivityLogs();
    logs.unshift({ id: 'local-' + Date.now() + '-' + logs.length, ...entry });
    if (logs.length > 100) logs.pop();
    this.tables.activity_logs = logs;
    this.enqueue(async () => {
      const { error } = await this.client.from('activity_logs').insert(entry);
      if (error) throw error;
    }, 'activity_logs');
  }

  // --------------------------------------------------------------------------
  // STATISTICS & METRICS
  // --------------------------------------------------------------------------
  getSystemStats() {
    const users = this.getAllUsers();
    const events = this.getAllEvents();
    const attendance = this.getAllAttendance();
    const certificates = this.getAllCertificates();
    const registrations = this.getAllRegistrations();

    return {
      totalUsers: users.length,
      totalOrganizers: users.filter(u => u.role === 'organizer').length,
      totalParticipants: users.filter(u => u.role === 'participant').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalEvents: events.length,
      totalRegistrations: registrations.length,
      totalAttendance: attendance.length,
      totalCertificates: certificates.length
    };
  }

  getEventStats(eventId) {
    const event = this.getEventById(eventId);
    if (!event) return null;

    const registrations = this.getRegistrationsForEvent(eventId);
    const attendance = this.getAttendanceForEvent(eventId);
    const totalReg = registrations.length;
    const totalAtt = attendance.length;
    const rate = totalReg > 0 ? Math.round((totalAtt / totalReg) * 100) : 0;

    return {
      event: event,
      capacity: event.capacity,
      totalRegistered: totalReg,
      availableSlots: Math.max(0, event.capacity - totalReg),
      totalAttended: totalAtt,
      pendingAttendance: Math.max(0, totalReg - totalAtt),
      attendanceRate: rate
    };
  }

  getOrganizerStats(organizerId) {
    const events = this.getEventsByOrganizer(organizerId);
    let totalReg = 0;
    let totalAtt = 0;

    events.forEach(e => {
      const regs = this.getRegistrationsForEvent(e.id);
      const atts = this.getAttendanceForEvent(e.id);
      totalReg += regs.length;
      totalAtt += atts.length;
    });

    const rate = totalReg > 0 ? Math.round((totalAtt / totalReg) * 100) : 0;
    return {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      totalRegistrations: totalReg,
      totalAttendees: totalAtt,
      attendancePercentage: rate
    };
  }

  getParticipantStats(participantId) {
    const regs = this.getRegistrationsForParticipant(participantId);
    const atts = this.getAllAttendance().filter(a => a.participant_id === participantId);
    const certs = this.getAllCertificates().filter(c => c.participant_id === participantId);

    return {
      totalRegistered: regs.length,
      totalAttended: atts.length,
      totalCertificates: certs.length
    };
  }

  // --------------------------------------------------------------------------
  // EXPORT ROSTER HELPERS (CSV & EXCEL)
  // --------------------------------------------------------------------------
  getEventRosterData(eventId) {
    const event = this.getEventById(eventId);
    const registrations = this.getRegistrationsForEvent(eventId);
    const attendanceList = this.getAttendanceForEvent(eventId);

    return registrations.map(reg => {
      const user = this.getUserById(reg.participant_id) || { full_name: 'Unknown', email: 'N/A', organization: 'N/A' };
      const att = attendanceList.find(a => a.registration_id === reg.id);
      return {
        registrationId: reg.id,
        fullName: user.full_name,
        email: user.email,
        organization: user.organization || 'General',
        registeredAt: reg.registered_at,
        status: att ? 'Attended' : 'Registered / Pending',
        checkInTime: att ? att.check_in_time : 'Not Checked In',
        qrCode: reg.qr_code,
        eventTitle: event ? event.title : 'Event'
      };
    });
  }

  exportAttendanceCSV(eventId) {
    const roster = this.getEventRosterData(eventId);
    const event = this.getEventById(eventId);
    const title = event ? event.title : 'Event';

    const headers = ['Registration ID', 'Full Name', 'Email', 'Organization', 'Registered Date', 'Attendance Status', 'Check-In Time', 'QR Code Token'];
    const rows = roster.map(r => [
      `"${r.registrationId}"`,
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.organization.replace(/"/g, '""')}"`,
      `"${r.registeredAt}"`,
      `"${r.status}"`,
      `"${r.checkInTime}"`,
      `"${r.qrCode}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `EventPass_Attendance_${(event ? event.title.substring(0, 20) : 'Roster').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`;

    this.downloadBlob(blob, filename);
  }

  exportAttendanceExcel(eventId) {
    const roster = this.getEventRosterData(eventId);
    const event = this.getEventById(eventId);
    const title = event ? event.title : 'Event Attendance Roster';

    // Generate formatted XML Excel document (works natively in Microsoft Excel, Google Sheets, LibreOffice)
    let excelXML = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="14" ss:Color="#1E1B4B"/>
  </Style>
  <Style ss:ID="Attended">
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Font ss:Color="#065F46" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Pending">
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Font ss:Color="#92400E"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Attendance">
  <Table>
   <Row><Cell ss:StyleID="Title"><Data ss:Type="String">EventPass Attendance: ${title}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Generated on: ${new Date().toLocaleString()}</Data></Cell></Row>
   <Row></Row>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Registration ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Full Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Email Address</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Organization / Track</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Registered At</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Attendance Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Check-In Time</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">QR Security Token</Data></Cell>
   </Row>`;

    roster.forEach(r => {
      const statusStyle = r.status === 'Attended' ? ' ss:StyleID="Attended"' : ' ss:StyleID="Pending"';
      excelXML += `
   <Row>
    <Cell><Data ss:Type="String">${r.registrationId}</Data></Cell>
    <Cell><Data ss:Type="String">${r.fullName}</Data></Cell>
    <Cell><Data ss:Type="String">${r.email}</Data></Cell>
    <Cell><Data ss:Type="String">${r.organization}</Data></Cell>
    <Cell><Data ss:Type="String">${r.registeredAt}</Data></Cell>
    <Cell${statusStyle}><Data ss:Type="String">${r.status}</Data></Cell>
    <Cell><Data ss:Type="String">${r.checkInTime}</Data></Cell>
    <Cell><Data ss:Type="String">${r.qrCode}</Data></Cell>
   </Row>`;
    });

    excelXML += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const filename = `EventPass_Attendance_${(event ? event.title.substring(0, 20) : 'Roster').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.xls`;
    this.downloadBlob(blob, filename);
  }

  downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

// Global Database Singleton (the app waits for `db.ready` before starting)
window.db = new EventPassDB();
