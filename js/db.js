/**
 * EventPass Relational Database Engine (Client-Side Storage)
 * Implements the 5 core tables + activity logs with relational integrity,
 * transaction-safe updates, and LocalStorage persistence.
 *
 * Tables:
 * 1. users
 * 2. events
 * 3. registrations
 * 4. attendance
 * 5. certificates
 * 6. activity_logs
 */

class EventPassDB {
  constructor() {
    this.storageKeyPrefix = 'eventpass_db_';
    this.init();
  }

  init() {
    if (!this.getTable('users')) {
      this.seedInitialDatabase();
    } else {
      this.migrateLegacyOrganizerName();
    }
  }

  // Browsers that opened an older build still hold the previous seeded names / emails.
  migrateLegacyOrganizerName() {
    const RENAMES = [
      ['Prof. Dominic Alcantara', 'Prof. Navarro'],
      ['Maria Clarissa Santos', 'Demo Student (JM)'],
      ['maria.santos@student.edu', 'demo.student@student.edu']
    ];
    const apply = (raw) => RENAMES.reduce((t, [o, n]) => t.split(o).join(n), raw);
    ['users', 'events', 'activity_logs'].forEach(table => {
      const raw = localStorage.getItem(this.storageKeyPrefix + table);
      if (raw) {
        const updated = apply(raw);
        if (updated !== raw) localStorage.setItem(this.storageKeyPrefix + table, updated);
      }
    });
    const sess = localStorage.getItem('eventpass_session_user');
    if (sess) {
      const updated = apply(sess);
      if (updated !== sess) localStorage.setItem('eventpass_session_user', updated);
    }
  }

  // Generic Table Get / Set
  getTable(tableName) {
    try {
      const raw = localStorage.getItem(this.storageKeyPrefix + tableName);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`Error loading table ${tableName}:`, e);
      return null;
    }
  }

  setTable(tableName, data) {
    try {
      localStorage.setItem(this.storageKeyPrefix + tableName, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving table ${tableName}:`, e);
    }
  }

  // Seed default demonstration database
  seedInitialDatabase() {
    const users = [
      {
        id: 'usr-admin-01',
        full_name: 'System Administrator',
        email: 'admin@eventpass.edu',
        password: 'admin',
        role: 'admin',
        organization: 'Campus IT Directorate',
        status: 'active',
        created_at: '2026-09-01 08:00:00'
      },
      {
        id: 'usr-org-01',
        full_name: 'Prof. Navarro',
        email: 'organizer@eventpass.edu',
        password: 'organizer',
        role: 'organizer',
        organization: 'College of Computer Studies',
        status: 'active',
        created_at: '2026-09-05 09:30:00'
      },
      {
        id: 'usr-org-02',
        full_name: 'Campus Student Council',
        email: 'council@eventpass.edu',
        password: 'council',
        role: 'organizer',
        organization: 'Supreme Student Directorate',
        status: 'active',
        created_at: '2026-09-10 14:00:00'
      },
      {
        id: 'usr-part-01',
        full_name: 'Demo Student (JM)',
        email: 'demo.student@student.edu',
        password: 'student',
        role: 'participant',
        organization: 'BS Information Technology (3rd Year)',
        status: 'active',
        created_at: '2026-09-15 10:15:00'
      },
      {
        id: 'usr-part-02',
        full_name: 'John Doe',
        email: 'john.doe@student.edu',
        password: 'student',
        role: 'participant',
        organization: 'BS Computer Science (2nd Year)',
        status: 'active',
        created_at: '2026-09-16 11:20:00'
      },
      {
        id: 'usr-part-03',
        full_name: 'Engr. Jonathan Reyes',
        email: 'jreyes@innovatecorp.com',
        password: 'guest',
        role: 'participant',
        organization: 'Innovate Solutions Inc. / Alumni Guest',
        status: 'active',
        created_at: '2026-09-20 16:40:00'
      }
    ];

    const events = [
      {
        id: 'evt-it-2026',
        organizer_id: 'usr-org-01',
        organizer_name: 'Prof. Navarro',
        title: 'IT Seminar 2026: Future of AI & Cloud Architectures',
        description: 'An advanced technological symposium exploring cloud computing scalability, deep neural networks, AI agent workflows, and zero-trust perimeter defense in modern enterprise systems.',
        category: 'Seminar',
        date: '2026-10-15',
        start_time: '09:00 AM',
        end_time: '04:00 PM',
        venue: 'Main Campus Auditorium & Tech Hall',
        capacity: 250,
        banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
        certificate_template: 'classic-gold',
        status: 'upcoming',
        created_at: '2026-09-12 10:00:00'
      },
      {
        id: 'evt-web-2026',
        organizer_id: 'usr-org-01',
        organizer_name: 'Prof. Navarro',
        title: 'Web Development Workshop: Modern Fullstack Engineering',
        description: 'A hands-on practical masterclass covering scalable Single Page Architecture, responsive design systems, RESTful microservices, and secure client-side database management.',
        category: 'Workshop',
        date: '2026-10-22',
        start_time: '10:00 AM',
        end_time: '03:30 PM',
        venue: 'CIT Computer Laboratory 401',
        capacity: 80,
        banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop',
        certificate_template: 'modern-tech',
        status: 'upcoming',
        created_at: '2026-09-18 11:30:00'
      },
      {
        id: 'evt-cyber-2026',
        organizer_id: 'usr-org-01',
        organizer_name: 'Prof. Navarro',
        title: 'Cybersecurity Awareness Seminar: Zero Trust & Ethical Defense',
        description: 'Crucial seminar addressing modern threat landscape, penetration testing fundamentals, zero-trust infrastructure, and incident response handling for IT students and professionals.',
        category: 'Seminar',
        date: '2026-10-28',
        start_time: '01:00 PM',
        end_time: '05:00 PM',
        venue: 'Audio-Visual Center & Hybrid Stream',
        capacity: 180,
        banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop',
        certificate_template: 'academic-blue',
        status: 'upcoming',
        created_at: '2026-09-22 09:00:00'
      },
      {
        id: 'evt-lead-2026',
        organizer_id: 'usr-org-02',
        organizer_name: 'Campus Student Council',
        title: 'Student Leadership Conference 2026: Inspiring Innovation',
        description: 'Annual gathering of student leaders, organization presidents, and youth ambassadors focusing on project execution, public communication, and ethical leadership.',
        category: 'Conference',
        date: '2026-11-05',
        start_time: '08:30 AM',
        end_time: '05:00 PM',
        venue: 'University Gymnasium & Grand Stage',
        capacity: 400,
        banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop',
        certificate_template: 'classic-gold',
        status: 'upcoming',
        created_at: '2026-09-25 14:00:00'
      }
    ];

    const registrations = [
      {
        id: 'reg-001',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-01',
        qr_code: 'EP-QR:evt-it-2026:usr-part-01:reg-001',
        registered_at: '2026-10-01 08:30:00',
        status: 'attended'
      },
      {
        id: 'reg-002',
        event_id: 'evt-web-2026',
        participant_id: 'usr-part-01',
        qr_code: 'EP-QR:evt-web-2026:usr-part-01:reg-002',
        registered_at: '2026-10-02 09:15:00',
        status: 'registered'
      },
      {
        id: 'reg-003',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-02',
        qr_code: 'EP-QR:evt-it-2026:usr-part-02:reg-003',
        registered_at: '2026-10-01 10:00:00',
        status: 'registered'
      },
      {
        id: 'reg-004',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-03',
        qr_code: 'EP-QR:evt-it-2026:usr-part-03:reg-004',
        registered_at: '2026-10-01 11:20:00',
        status: 'attended'
      }
    ];

    const attendance = [
      {
        id: 'att-001',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-01',
        registration_id: 'reg-001',
        check_in_time: '08:45:12 AM',
        scanned_by: 'usr-org-01',
        status: 'verified'
      },
      {
        id: 'att-002',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-03',
        registration_id: 'reg-004',
        check_in_time: '08:52:40 AM',
        scanned_by: 'usr-org-01',
        status: 'verified'
      }
    ];

    const certificates = [
      {
        id: 'cert-001',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-01',
        certificate_id: 'CERT-2026-IT-98214',
        issued_at: '2026-10-15 09:00:00',
        certificate_file: 'EP-Certificate-Demo-Student-JM.pdf'
      },
      {
        id: 'cert-002',
        event_id: 'evt-it-2026',
        participant_id: 'usr-part-03',
        certificate_id: 'CERT-2026-IT-48190',
        issued_at: '2026-10-15 09:10:00',
        certificate_file: 'EP-Certificate-Engr-Jonathan-Reyes.pdf'
      }
    ];

    const activity_logs = [
      {
        id: 1,
        user_email: 'admin@eventpass.edu',
        action: 'SYSTEM_INITIALIZE',
        details: 'EventPass core relational database initialized with demo seeds.',
        timestamp: '2026-10-01 08:00:00'
      },
      {
        id: 2,
        user_email: 'organizer@eventpass.edu',
        action: 'CREATE_EVENT',
        details: 'Created new event: IT Seminar 2026: Future of AI & Cloud Architectures',
        timestamp: '2026-10-01 08:15:00'
      },
      {
        id: 3,
        user_email: 'demo.student@student.edu',
        action: 'EVENT_REGISTRATION',
        details: 'Participant registered for IT Seminar 2026. Generated ticket reg-001.',
        timestamp: '2026-10-01 08:30:00'
      },
      {
        id: 4,
        user_email: 'organizer@eventpass.edu',
        action: 'ATTENDANCE_CHECKIN',
        details: 'Scanned QR code for Demo Student (JM). Attendance confirmed.',
        timestamp: '2026-10-15 08:45:12'
      },
      {
        id: 5,
        user_email: 'demo.student@student.edu',
        action: 'CERTIFICATE_GENERATION',
        details: 'Automated certificate CERT-2026-IT-98214 generated and issued.',
        timestamp: '2026-10-15 09:00:00'
      }
    ];

    this.setTable('users', users);
    this.setTable('events', events);
    this.setTable('registrations', registrations);
    this.setTable('attendance', attendance);
    this.setTable('certificates', certificates);
    this.setTable('activity_logs', activity_logs);
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

    const regId = 'reg-' + Math.floor(1000 + Math.random() * 9000);
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
      id: 'att-' + Math.floor(1000 + Math.random() * 9000),
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
        id: 'att-' + Math.floor(1000 + Math.random() * 9000),
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
      id: 'cert-' + Math.floor(1000 + Math.random() * 9000),
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
    const logs = this.getActivityLogs();
    const newLog = {
      id: logs.length + 1,
      user_email: userEmail,
      action: action,
      details: details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    this.setTable('activity_logs', logs);
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

// Global Database Singleton
window.db = new EventPassDB();
