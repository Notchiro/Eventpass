/**
 * EventPass Main Application Controller
 * Handles routing, authentication, role-based dashboards, event management,
 * attendance scanning, certificate studio, exports, and administration.
 */

class EventPassController {
  constructor() {
    this.currentUser = null;
    this.currentView = 'landing';
    this.selectedEventId = null;
    this.activeRosterEventId = null;
    this.activeScannerEventId = null;
    this.currentModalCertData = null;
    this.searchQuery = '';
    this.categoryFilter = 'all';

    this.init();
  }

  init() {
    // Check saved session or default to demo participant for immediate exploration
    const savedUser = localStorage.getItem('eventpass_session_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = window.db.getUserByEmail('demo.student@student.edu');
      }
    } else {
      // Default to participant demo account
      this.currentUser = window.db.getUserByEmail('demo.student@student.edu');
      localStorage.setItem('eventpass_session_user', JSON.stringify(this.currentUser));
    }

    this.updateUserSessionUI();
    this.renderCurrentView();
    this.bindGlobalEvents();
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION & ROLE SWITCHING
  // --------------------------------------------------------------------------
  login(email, password) {
    const user = window.db.getUserByEmail(email);
    if (!user) {
      this.showToast('Account not found with this email.', 'error');
      return false;
    }

    if (user.password !== password) {
      this.showToast('Incorrect password. Please try again.', 'error');
      return false;
    }

    if (user.status === 'inactive') {
      this.showToast('This account is deactivated. Contact administrator.', 'error');
      return false;
    }

    this.currentUser = user;
    localStorage.setItem('eventpass_session_user', JSON.stringify(user));
    window.db.logActivity(user.email, 'USER_LOGIN', `Logged in with role: ${user.role}`);

    this.updateUserSessionUI();
    this.showToast(`Welcome back, ${user.full_name}!`, 'success');

    // Route to appropriate role dashboard
    if (user.role === 'admin') {
      this.navigateTo('admin-dashboard');
    } else if (user.role === 'organizer') {
      this.navigateTo('organizer-dashboard');
    } else {
      this.navigateTo('participant-dashboard');
    }
    return true;
  }

  logout() {
    if (this.currentUser) {
      window.db.logActivity(this.currentUser.email, 'USER_LOGOUT', 'Logged out of session');
    }
    this.currentUser = null;
    localStorage.removeItem('eventpass_session_user');
    this.updateUserSessionUI();
    this.showToast('You have been logged out.', 'info');
    this.navigateTo('landing');
  }

  switchDemoUser(role) {
    let email = 'demo.student@student.edu';
    if (role === 'admin') email = 'admin@eventpass.edu';
    if (role === 'organizer') email = 'organizer@eventpass.edu';
    if (role === 'participant2') email = 'john.doe@student.edu';

    const user = window.db.getUserByEmail(email);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('eventpass_session_user', JSON.stringify(user));
      this.updateUserSessionUI();
      this.showToast(`Switched role to: ${user.role.toUpperCase()} (${user.full_name})`, 'success');

      if (user.role === 'admin') this.navigateTo('admin-dashboard');
      else if (user.role === 'organizer') this.navigateTo('organizer-dashboard');
      else this.navigateTo('participant-dashboard');
    }
  }

  updateUserSessionUI() {
    const demoBar = document.getElementById('demoRoleBar');
    const userNavSection = document.getElementById('userNavSection');
    const guestNavSection = document.getElementById('guestNavSection');
    const currentUserNameEl = document.getElementById('currentUserName');
    const currentUserRoleEl = document.getElementById('currentUserRole');

    // Update active demo pill highlight
    const demoBtns = document.querySelectorAll('.demo-role-pill');
    demoBtns.forEach(btn => {
      btn.classList.remove('active');
      if (this.currentUser) {
        if (btn.dataset.role === this.currentUser.role) {
          btn.classList.add('active');
        }
      }
    });

    if (this.currentUser) {
      if (userNavSection) userNavSection.style.display = 'flex';
      if (guestNavSection) guestNavSection.style.display = 'none';
      if (currentUserNameEl) currentUserNameEl.textContent = this.currentUser.full_name;
      if (currentUserRoleEl) {
        currentUserRoleEl.textContent = this.currentUser.role.toUpperCase();
        currentUserRoleEl.className = `role-badge badge-${this.currentUser.role}`;
      }

      // Dynamic role-based navigation links
      this.updateNavigationLinks();
    } else {
      if (userNavSection) userNavSection.style.display = 'none';
      if (guestNavSection) guestNavSection.style.display = 'flex';
      this.updateNavigationLinks();
    }
  }

  updateNavigationLinks() {
    const navLinksContainer = document.getElementById('mainNavLinks');
    if (!navLinksContainer) return;

    let linksHtml = `
      <button class="nav-link ${this.currentView === 'landing' ? 'active' : ''}" onclick="app.navigateTo('landing')">Home</button>
      <button class="nav-link ${this.currentView === 'events' ? 'active' : ''}" onclick="app.navigateTo('events')">Events</button>
      <button class="nav-link ${this.currentView === 'about' ? 'active' : ''}" onclick="app.navigateTo('about')">About</button>
    `;

    if (this.currentUser) {
      if (this.currentUser.role === 'participant') {
        linksHtml += `
          <button class="nav-link ${this.currentView === 'participant-dashboard' ? 'active' : ''}" onclick="app.navigateTo('participant-dashboard')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Tickets
          </button>
        `;
      } else if (this.currentUser.role === 'organizer') {
        linksHtml += `
          <button class="nav-link ${this.currentView === 'organizer-dashboard' ? 'active' : ''}" onclick="app.navigateTo('organizer-dashboard')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Organizer Hub
          </button>
          <button class="nav-link ${this.currentView === 'scanner' ? 'active' : ''}" onclick="app.navigateTo('scanner')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
            Gate Scanner
          </button>
        `;
      } else if (this.currentUser.role === 'admin') {
        linksHtml += `
          <button class="nav-link ${this.currentView === 'admin-dashboard' ? 'active' : ''}" onclick="app.navigateTo('admin-dashboard')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Admin Control
          </button>
        `;
      }
    }

    navLinksContainer.innerHTML = linksHtml;
  }

  // --------------------------------------------------------------------------
  // ROUTING & NAVIGATION
  // --------------------------------------------------------------------------
  navigateTo(viewName, param = null) {
    // Access control checks
    if (viewName === 'participant-dashboard' && (!this.currentUser || this.currentUser.role !== 'participant')) {
      if (!this.currentUser) {
        this.showToast('Please log in as a participant to view your dashboard.', 'info');
        this.navigateTo('login');
        return;
      }
    }

    if (viewName === 'organizer-dashboard' && (!this.currentUser || (this.currentUser.role !== 'organizer' && this.currentUser.role !== 'admin'))) {
      this.showToast('Access restricted: Organizer account required.', 'error');
      return;
    }

    if (viewName === 'admin-dashboard' && (!this.currentUser || this.currentUser.role !== 'admin')) {
      this.showToast('Access restricted: System Administrator credentials required.', 'error');
      return;
    }

    if (viewName === 'scanner' && (!this.currentUser || (this.currentUser.role !== 'organizer' && this.currentUser.role !== 'admin'))) {
      this.showToast('Access restricted: Gate scanner is for Event Organizers and Staff.', 'error');
      return;
    }

    // Stop camera if navigating away from scanner
    if (this.currentView === 'scanner' && viewName !== 'scanner') {
      window.qrEngine.stopCameraScanner();
    }

    this.currentView = viewName;
    if (param) {
      if (viewName === 'event-details') this.selectedEventId = param;
      if (viewName === 'attendance') this.activeRosterEventId = param;
      if (viewName === 'scanner') this.activeScannerEventId = param;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.updateNavigationLinks();
    this.renderCurrentView();
  }

  renderCurrentView() {
    // Hide all view containers
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(`view-${this.currentView}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Call view-specific renderers
    switch (this.currentView) {
      case 'landing':
        this.renderLandingPage();
        break;
      case 'events':
        this.renderEventsListing();
        break;
      case 'event-details':
        this.renderEventDetails();
        break;
      case 'participant-dashboard':
        this.renderParticipantDashboard();
        break;
      case 'organizer-dashboard':
        this.renderOrganizerDashboard();
        break;
      case 'scanner':
        this.renderScannerView();
        break;
      case 'attendance':
        this.renderAttendanceRoster();
        break;
      case 'admin-dashboard':
        this.renderAdminDashboard();
        break;
      case 'login':
        this.renderLoginPage();
        break;
      case 'register':
        this.renderRegisterPage();
        break;
      case 'about':
        // Static content
        break;
    }
  }

  // --------------------------------------------------------------------------
  // 1. LANDING PAGE
  // --------------------------------------------------------------------------
  renderLandingPage() {
    const stats = window.db.getSystemStats();
    const statEvents = document.getElementById('statTotalEvents');
    const statAttendees = document.getElementById('statTotalAttendees');
    const statCerts = document.getElementById('statTotalCerts');
    const statCheckins = document.getElementById('statTotalCheckins');

    if (statEvents) statEvents.textContent = stats.totalEvents;
    if (statAttendees) statAttendees.textContent = stats.totalUsers;
    if (statCerts) statCerts.textContent = stats.totalCertificates;
    if (statCheckins) statCheckins.textContent = stats.totalAttendance;

    // Featured Events Container
    const featuredContainer = document.getElementById('landingFeaturedEvents');
    if (featuredContainer) {
      const events = window.db.getAllEvents().slice(0, 3);
      featuredContainer.innerHTML = events.map(evt => this.createEventCardHtml(evt, false)).join('');
    }
  }

  // --------------------------------------------------------------------------
  // 2. EVENTS LISTING
  // --------------------------------------------------------------------------
  renderEventsListing() {
    const container = document.getElementById('eventsGrid');
    if (!container) return;

    let events = window.db.getAllEvents();

    // Category filter
    if (this.categoryFilter !== 'all') {
      events = events.filter(e => e.category.toLowerCase() === this.categoryFilter.toLowerCase());
    }

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.venue.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) ||
        (e.organizer_name && e.organizer_name.toLowerCase().includes(q))
      );
    }

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>No events match your criteria</h3>
          <p>Try searching with another keyword or resetting the filter category.</p>
          <button class="btn btn-secondary btn-sm" onclick="app.resetEventsFilter()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(evt => this.createEventCardHtml(evt, true)).join('');
  }

  createEventCardHtml(evt, showRegisterBtn = true) {
    const stats = window.db.getEventStats(evt.id);
    const capacityPct = Math.min(100, Math.round((stats.totalRegistered / evt.capacity) * 100));
    const isRegistered = this.currentUser ? window.db.isParticipantRegistered(evt.id, this.currentUser.id) : false;

    return `
      <div class="card event-card">
        <div class="event-card-banner" style="background-image: url('${evt.banner}');">
          <span class="event-category-pill">${evt.category}</span>
          ${isRegistered ? '<span class="registered-badge">✓ Registered</span>' : ''}
        </div>
        <div class="event-card-body">
          <h3 class="event-card-title">${this.escapeHtml(evt.title)}</h3>
          <p class="event-card-desc">${this.escapeHtml(evt.description.substring(0, 110))}...</p>
          
          <div class="event-meta-rows">
            <div class="meta-row">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${evt.date} • ${evt.start_time}</span>
            </div>
            <div class="meta-row">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${this.escapeHtml(evt.venue)}</span>
            </div>
            <div class="meta-row">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Host: ${this.escapeHtml(evt.organizer_name || 'Academic Committee')}</span>
            </div>
          </div>

          <div class="capacity-bar-container">
            <div class="capacity-labels">
              <span>Slots Available: <strong>${stats.availableSlots} / ${evt.capacity}</strong></span>
              <span>${capacityPct}%</span>
            </div>
            <div class="capacity-bar">
              <div class="capacity-bar-fill" style="width: ${capacityPct}%;"></div>
            </div>
          </div>

          <div class="event-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="app.navigateTo('event-details', '${evt.id}')">View Event</button>
            ${showRegisterBtn ? (
              isRegistered
                ? `<button class="btn btn-success btn-sm" onclick="app.viewTicketModal('${evt.id}', '${this.currentUser.id}')">View My Pass</button>`
                : (stats.availableSlots <= 0
                  ? `<button class="btn btn-secondary btn-sm" disabled>Full Capacity</button>`
                  : `<button class="btn btn-primary btn-sm" onclick="app.quickRegister('${evt.id}')">Register</button>`)
            ) : ''}
          </div>
        </div>
      </div>
    `;
  }

  resetEventsFilter() {
    this.searchQuery = '';
    this.categoryFilter = 'all';
    const searchInput = document.getElementById('eventSearchInput');
    if (searchInput) searchInput.value = '';
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
    this.renderEventsListing();
  }

  // --------------------------------------------------------------------------
  // 3. EVENT DETAILS PAGE
  // --------------------------------------------------------------------------
  renderEventDetails() {
    const event = window.db.getEventById(this.selectedEventId);
    if (!event) {
      this.navigateTo('events');
      return;
    }

    const stats = window.db.getEventStats(event.id);
    const capacityPct = Math.min(100, Math.round((stats.totalRegistered / event.capacity) * 100));
    const isRegistered = this.currentUser ? window.db.isParticipantRegistered(event.id, this.currentUser.id) : false;

    // Fill Details
    document.getElementById('detailBanner').style.backgroundImage = `url('${event.banner}')`;
    document.getElementById('detailCategory').textContent = event.category;
    document.getElementById('detailTitle').textContent = event.title;
    document.getElementById('detailDate').textContent = `${event.date} • ${event.start_time} - ${event.end_time}`;
    document.getElementById('detailVenue').textContent = event.venue;
    document.getElementById('detailOrganizer').textContent = event.organizer_name || 'Academic Directorate';
    document.getElementById('detailDescription').textContent = event.description;
    document.getElementById('detailCapacityText').textContent = `${stats.totalRegistered} registered / ${event.capacity} total seats (${stats.availableSlots} slots remaining)`;
    document.getElementById('detailCapacityBar').style.width = `${capacityPct}%`;

    // Registration Card Action
    const actionContainer = document.getElementById('detailRegisterBox');
    if (!this.currentUser) {
      actionContainer.innerHTML = `
        <div class="alert-box alert-info">
          <strong>Registration open for all students and guests!</strong>
          <p>Please log in or create an EventPass account to claim your personal QR ticket.</p>
          <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm" onclick="app.navigateTo('login')">Log In to Register</button>
            <button class="btn btn-secondary btn-sm" onclick="app.navigateTo('register')">Create Account</button>
          </div>
        </div>
      `;
    } else if (isRegistered) {
      const reg = window.db.getRegistrationsForEvent(event.id).find(r => r.participant_id === this.currentUser.id);
      const att = window.db.getAttendanceRecord(event.id, this.currentUser.id);

      actionContainer.innerHTML = `
        <div class="ticket-status-box">
          <div class="status-indicator">
            <span class="badge ${att ? 'badge-attended' : 'badge-registered'}">
              ${att ? '✓ Attendance Confirmed' : '✓ Registration Confirmed'}
            </span>
          </div>
          <h4>You are registered for this event!</h4>
          <p>Your unique QR ticket pass has been generated. Present it at the venue entrance scanner.</p>
          
          <div class="pass-preview-mini">
            <div id="miniPassQr"></div>
            <div class="mini-pass-meta">
              <div><strong>Registration ID:</strong> <span class="font-mono text-cyan">${reg.id}</span></div>
              <div><strong>Status:</strong> ${att ? 'Checked In (' + att.check_in_time + ')' : 'Ready for Scan'}</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;">
            <button class="btn btn-primary" onclick="app.viewTicketModal('${event.id}', '${this.currentUser.id}')">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              View Full QR Ticket Pass
            </button>
            ${att ? `
              <button class="btn btn-success" onclick="app.viewCertificateModal('${event.id}', '${this.currentUser.id}')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Download Certificate
              </button>
            ` : ''}
          </div>
        </div>
      `;

      setTimeout(() => {
        window.qrEngine.generateQRCode('miniPassQr', reg.qr_code, 120);
      }, 50);
    } else {
      if (stats.availableSlots <= 0) {
        actionContainer.innerHTML = `
          <div class="alert-box alert-warning">
            <strong>Registration Full</strong>
            <p>This event has reached its maximum seat capacity of ${event.capacity}. Check back later or explore other sessions.</p>
          </div>
        `;
      } else {
        actionContainer.innerHTML = `
          <div class="register-prompt-box">
            <h4>Ready to Attend?</h4>
            <p>Claim your slot for "${this.escapeHtml(event.title)}". Your personalized QR attendance ticket will be created instantly.</p>
            <button class="btn btn-primary btn-lg" onclick="app.quickRegister('${event.id}')" style="width: 100%;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              Register for This Event
            </button>
          </div>
        `;
      }
    }
  }

  quickRegister(eventId) {
    if (!this.currentUser) {
      this.showToast('Please log in or create an account to register.', 'info');
      this.navigateTo('login');
      return;
    }

    try {
      const reg = window.db.registerParticipant(eventId, this.currentUser.id);
      this.showToast('Registration successful! Your QR pass is ready.', 'success');
      this.renderEventDetails();
      // Open the ticket modal right away so participant gets immediate feedback!
      this.viewTicketModal(eventId, this.currentUser.id);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 4. PARTICIPANT DASHBOARD
  // --------------------------------------------------------------------------
  renderParticipantDashboard() {
    if (!this.currentUser) return;

    document.getElementById('partWelcomeName').textContent = this.currentUser.full_name;
    document.getElementById('partOrg').textContent = this.currentUser.organization || 'Participant';

    const pStats = window.db.getParticipantStats(this.currentUser.id);
    document.getElementById('partStatRegistered').textContent = pStats.totalRegistered;
    document.getElementById('partStatAttended').textContent = pStats.totalAttended;
    document.getElementById('partStatCerts').textContent = pStats.totalCertificates;

    const registrations = window.db.getRegistrationsForParticipant(this.currentUser.id);
    const container = document.getElementById('partEventsList');
    if (!container) return;

    if (registrations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" stroke="var(--text-dim)" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3>You haven't registered for any events yet</h3>
          <p>Browse campus events, register online, and receive your digital QR tickets immediately.</p>
          <button class="btn btn-primary" onclick="app.navigateTo('events')">Explore Events</button>
        </div>
      `;
      return;
    }

    container.innerHTML = registrations.map(reg => {
      const event = window.db.getEventById(reg.event_id) || { title: 'Unknown Event', date: 'N/A', venue: 'N/A' };
      const attendance = window.db.getAttendanceRecord(reg.event_id, this.currentUser.id);
      const isAttended = !!attendance;

      return `
        <div class="card participant-event-card">
          <div class="part-card-header">
            <div>
              <span class="badge ${isAttended ? 'badge-attended' : 'badge-registered'}">
                ${isAttended ? '✓ Attendance Verified' : 'Registered / Ready for Scan'}
              </span>
              <h3 class="part-card-title">${this.escapeHtml(event.title)}</h3>
            </div>
            <div class="part-reg-id">
              Ticket ID: <code>${reg.id}</code>
            </div>
          </div>

          <div class="part-card-body">
            <div class="part-info-grid">
              <div><strong>Date:</strong> ${event.date} (${event.start_time || '09:00 AM'})</div>
              <div><strong>Venue:</strong> ${this.escapeHtml(event.venue)}</div>
              <div><strong>Registered On:</strong> ${reg.registered_at.substring(0, 10)}</div>
              <div><strong>Check-In Time:</strong> ${isAttended ? `<span class="text-success font-semibold">${attendance.check_in_time}</span>` : '<span class="text-muted">Pending gate scan</span>'}</div>
            </div>
          </div>

          <div class="part-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="app.viewTicketModal('${event.id}', '${this.currentUser.id}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle></svg>
              View QR Ticket
            </button>

            ${isAttended ? `
              <button class="btn btn-success btn-sm" onclick="app.viewCertificateModal('${event.id}', '${this.currentUser.id}')">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                Download Certificate
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" disabled title="Certificate unlocks automatically after gate attendance check-in.">
                🔒 Certificate Locked
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // 5. ORGANIZER DASHBOARD
  // --------------------------------------------------------------------------
  renderOrganizerDashboard() {
    if (!this.currentUser) return;

    const stats = window.db.getOrganizerStats(this.currentUser.id);
    document.getElementById('orgStatTotalEvents').textContent = stats.totalEvents;
    document.getElementById('orgStatUpcoming').textContent = stats.upcomingEvents;
    document.getElementById('orgStatTotalReg').textContent = stats.totalRegistrations;
    document.getElementById('orgStatTotalAtt').textContent = stats.totalAttendees;
    document.getElementById('orgStatRate').textContent = `${stats.attendancePercentage}%`;

    const events = window.db.getEventsByOrganizer(this.currentUser.id);
    const container = document.getElementById('orgEventsTableBody');
    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-dim);">
            You haven't created any events yet. Click <strong>"Create New Event"</strong> to start.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = events.map(evt => {
      const eStats = window.db.getEventStats(evt.id);
      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #ffffff;">${this.escapeHtml(evt.title)}</div>
            <div style="font-size: 0.78rem; color: var(--text-dim);">${evt.category} • ${evt.venue}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem;">${evt.date}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${evt.start_time} - ${evt.end_time}</div>
          </td>
          <td>
            <strong>${eStats.totalRegistered} / ${evt.capacity}</strong>
          </td>
          <td>
            <span class="badge badge-attended">${eStats.totalAttended} (${eStats.attendanceRate}%)</span>
          </td>
          <td>
            <span class="badge ${evt.status === 'upcoming' ? 'badge-registered' : 'badge-attended'}">${evt.status}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-primary btn-xs" onclick="app.navigateTo('scanner', '${evt.id}')" title="Scan QR Attendance">
                📷 Scan
              </button>
              <button class="btn btn-secondary btn-xs" onclick="app.navigateTo('attendance', '${evt.id}')" title="Manage Attendance Roster">
                📋 Roster
              </button>
              <button class="btn btn-secondary btn-xs" onclick="app.openEditEventModal('${evt.id}')" title="Edit Event">
                ✏️ Edit
              </button>
              <button class="btn btn-danger btn-xs" onclick="app.confirmDeleteEvent('${evt.id}')" title="Delete Event">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // 6. QR CODE ATTENDANCE SCANNER
  // --------------------------------------------------------------------------
  renderScannerView() {
    const events = window.db.getAllEvents();
    const eventSelect = document.getElementById('scannerEventSelect');
    if (!eventSelect) return;

    eventSelect.innerHTML = events.map(e => `
      <option value="${e.id}" ${this.activeScannerEventId === e.id ? 'selected' : ''}>
        ${this.escapeHtml(e.title)} (${e.date})
      </option>
    `).join('');

    if (!this.activeScannerEventId && events.length > 0) {
      this.activeScannerEventId = events[0].id;
    }

    // Camera is stopped whenever we leave this page, so make the UI match
    if (!window.qrEngine.isScanning) this.resetCameraUI();

    this.updateScannerStats();
    this.populateScannerSimulator();
  }

  updateScannerStats() {
    const eventId = document.getElementById('scannerEventSelect')?.value || this.activeScannerEventId;
    if (!eventId) return;

    const stats = window.db.getEventStats(eventId);
    if (!stats) return;

    const elReg = document.getElementById('scanStatRegistered');
    const elAtt = document.getElementById('scanStatAttended');
    const elPct = document.getElementById('scanStatPercent');

    if (elReg) elReg.textContent = stats.totalRegistered;
    if (elAtt) elAtt.textContent = stats.totalAttended;
    if (elPct) elPct.textContent = `${stats.attendanceRate}%`;
  }

  populateScannerSimulator() {
    const eventId = document.getElementById('scannerEventSelect')?.value || this.activeScannerEventId;
    const select = document.getElementById('scannerSimSelect');
    if (!select) return;

    const registrations = window.db.getRegistrationsForEvent(eventId);
    if (registrations.length === 0) {
      select.innerHTML = '<option value="">No registered attendees for this event</option>';
      return;
    }

    select.innerHTML = registrations.map(reg => {
      const user = window.db.getUserById(reg.participant_id);
      const att = window.db.getAttendanceRecord(eventId, reg.participant_id);
      const statusText = att ? `[ALREADY CHECKED IN at ${att.check_in_time}]` : '[READY FOR SCAN]';
      return `
        <option value="${reg.qr_code}">
          ${user ? user.full_name : 'Attendee'} (${reg.id}) ${statusText}
        </option>
      `;
    }).join('');
  }

  // Reset the scanner panel UI to its idle state (camera off)
  resetCameraUI(message = 'Scanner idle. Ready for gate verification.') {
    const cameraPlaceholder = document.getElementById('scannerCameraPlaceholder');
    const statusMsg = document.getElementById('scannerStatusMessage');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const camSelect = document.getElementById('scannerCameraSelect');

    if (cameraPlaceholder) cameraPlaceholder.style.display = 'flex';
    if (statusMsg) statusMsg.textContent = message;
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    if (camSelect) camSelect.style.display = 'none';
  }

  // Called for every decoded camera frame. The camera decodes the same QR many
  // times per second, so ignore repeats until the code has left the view for 4s.
  onCameraDecode(decodedText) {
    const now = Date.now();
    const isRepeat = decodedText === this._lastScanText && (now - (this._lastScanAt || 0)) < 4000;
    this._lastScanText = decodedText;
    this._lastScanAt = now;
    if (isRepeat) return;
    this.handleScanResult(decodedText);
  }

  async startCamera(preferredCameraId = null) {
    const cameraPlaceholder = document.getElementById('scannerCameraPlaceholder');
    const statusMsg = document.getElementById('scannerStatusMessage');

    // Browsers only allow camera access on HTTPS or localhost (not file://)
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera needs a secure page (https:// or localhost). Opening index.html directly from a folder (file://) blocks the camera. Use the Netlify/Vercel link, run a local server, or use the manual token / image upload / simulator.';
      if (statusMsg) statusMsg.textContent = msg;
      this.showToast('Camera blocked: page is not served over HTTPS or localhost.', 'warning');
      return;
    }

    try {
      if (statusMsg) statusMsg.textContent = 'Requesting camera permissions...';

      // Show the viewport (placeholder hidden) BEFORE starting so the library can measure it
      if (cameraPlaceholder) cameraPlaceholder.style.display = 'none';

      this._lastScanText = null;
      await window.qrEngine.startCameraScanner('qrScannerReader', (decodedText) => {
        this.onCameraDecode(decodedText);
      }, preferredCameraId);

      if (statusMsg) statusMsg.textContent = 'Gate camera active. Hold QR code in front of lens.';
      document.getElementById('startCameraBtn').style.display = 'none';
      document.getElementById('stopCameraBtn').style.display = 'inline-flex';

      // Populate the camera picker (only when there is more than one camera)
      const cameras = await window.qrEngine.getCameras();
      const camSelect = document.getElementById('scannerCameraSelect');
      if (camSelect && cameras.length > 1) {
        camSelect.innerHTML = cameras.map((c, i) =>
          `<option value="${this.escapeHtml(c.id)}" ${c.id === window.qrEngine.selectedCameraId ? 'selected' : ''}>${this.escapeHtml(c.label || 'Camera ' + (i + 1))}</option>`
        ).join('');
        camSelect.style.display = 'inline-block';
      }
    } catch (err) {
      console.warn('Camera error:', err);
      this.resetCameraUI();

      let reason = err && err.message ? err.message : String(err);
      const name = err && err.name ? err.name : '';
      if (name === 'NotAllowedError' || /permission|denied/i.test(reason)) {
        reason = 'Camera permission was denied. Click the lock icon in the address bar, allow Camera, then try again.';
      } else if (name === 'NotFoundError' || /requested device not found|no camera/i.test(reason)) {
        reason = 'No camera was found on this device.';
      } else if (name === 'NotReadableError' || /could not start video source|in use/i.test(reason)) {
        reason = 'The camera is being used by another app or browser tab. Close it and try again.';
      }
      if (statusMsg) statusMsg.textContent = `Camera error: ${reason} You can use the manual token, image upload, or Quick Test Simulator.`;
      this.showToast('Camera access unavailable. Use the simulator, token box, or image upload.', 'warning');
    }
  }

  async switchCamera(cameraId) {
    if (!cameraId) return;
    await this.startCamera(cameraId);
  }

  async stopCamera() {
    await window.qrEngine.stopCameraScanner();
    this.resetCameraUI('Scanner idle. Start camera or select attendee to simulate.');
  }

  // Manual ticket token entry (works on any browser, no camera needed)
  verifyManualToken() {
    const input = document.getElementById('manualTokenInput');
    const token = input ? input.value.trim() : '';
    if (!token) {
      this.showToast('Paste or type a ticket token first.', 'warning');
      return;
    }
    this.handleScanResult(token);
    if (input) input.value = '';
  }

  resetCurrentEventAttendance() {
    const eventId = document.getElementById('scannerEventSelect')?.value || this.activeScannerEventId;
    if (!eventId) return;
    if (!confirm('Clear all attendance records and issued certificates for this event? (Demo reset)')) return;
    window.db.resetEventAttendance(eventId);
    this.showToast('Attendance reset for this event.', 'info');
    const feedbackBox = document.getElementById('scanFeedbackResult');
    if (feedbackBox) {
      feedbackBox.className = 'scan-feedback-box scan-feedback-idle';
      feedbackBox.innerHTML = `
        <div class="feedback-icon">📷</div>
        <div class="feedback-content">
          <h4 class="feedback-title">Awaiting Next Ticket</h4>
          <p>Present attendee QR ticket to the camera, upload badge/QR image, or use the quick test simulator below.</p>
        </div>`;
    }
    this.updateScannerStats();
    this.populateScannerSimulator();
  }

  downloadCurrentRawQRCode() {
    const modal = document.getElementById('qrTicketModal');
    if (!modal || !modal.dataset.ticketData) return;
    window.qrEngine.downloadQRCodeOnly(JSON.parse(modal.dataset.ticketData));
    this.showToast('QR code image downloaded.', 'success');
  }

  handleScanResult(qrString) {
    const targetEventId = document.getElementById('scannerEventSelect')?.value || this.activeScannerEventId;
    const scannerUserId = this.currentUser ? this.currentUser.id : 'usr-org-01';

    const result = window.db.processQRScan(qrString, targetEventId, scannerUserId);
    const feedbackBox = document.getElementById('scanFeedbackResult');

    if (result.success) {
      // Triumph audio chime
      window.qrEngine.playAudioFeedback('success');

      feedbackBox.className = 'scan-feedback-box scan-feedback-success';
      feedbackBox.innerHTML = `
        <div class="feedback-icon">✓</div>
        <div class="feedback-content">
          <h3 class="feedback-title">${result.message}</h3>
          <div class="feedback-name">${this.escapeHtml(result.attendee.full_name)}</div>
          <div class="feedback-meta">
            <div><strong>Event:</strong> ${this.escapeHtml(result.event.title)}</div>
            <div><strong>Check-In Time:</strong> <span class="text-cyan font-bold">${result.checkInTime}</span></div>
            <div><strong>Registration ID:</strong> <code>${result.regId}</code></div>
            <div><strong>Certificate:</strong> Issued Automatically (${result.certificateId})</div>
          </div>
        </div>
      `;

      this.showToast(`Attendance Confirmed for ${result.attendee.full_name}!`, 'success');
      this.updateScannerStats();
      this.populateScannerSimulator();
    } else {
      if (result.code === 'ALREADY_CHECKED_IN') {
        window.qrEngine.playAudioFeedback('warning');
        feedbackBox.className = 'scan-feedback-box scan-feedback-warning';
        feedbackBox.innerHTML = `
          <div class="feedback-icon">⚠️</div>
          <div class="feedback-content">
            <h3 class="feedback-title">Duplicate Check-In Detected</h3>
            <p>${result.message}</p>
            <div class="feedback-name">${result.attendee ? this.escapeHtml(result.attendee.full_name) : ''}</div>
            <div style="font-size: 0.8rem; margin-top: 0.25rem;">Original Check-in: <strong>${result.checkInTime}</strong></div>
          </div>
        `;
        this.showToast('Attendee already checked in!', 'warning');
      } else {
        window.qrEngine.playAudioFeedback('error');
        feedbackBox.className = 'scan-feedback-box scan-feedback-error';
        feedbackBox.innerHTML = `
          <div class="feedback-icon">✕</div>
          <div class="feedback-content">
            <h3 class="feedback-title">Scan Rejected</h3>
            <p>${result.message}</p>
          </div>
        `;
        this.showToast(result.message, 'error');
      }
    }
  }

  simulateSelectedScan() {
    const select = document.getElementById('scannerSimSelect');
    if (!select || !select.value) {
      this.showToast('Please select a participant to simulate.', 'warning');
      return;
    }
    this.handleScanResult(select.value);
  }

  // --------------------------------------------------------------------------
  // 7. ATTENDANCE MANAGEMENT ROSTER
  // --------------------------------------------------------------------------
  renderAttendanceRoster() {
    const events = window.db.getAllEvents();
    const eventSelect = document.getElementById('rosterEventSelect');
    if (!eventSelect) return;

    eventSelect.innerHTML = events.map(e => `
      <option value="${e.id}" ${this.activeRosterEventId === e.id ? 'selected' : ''}>
        ${this.escapeHtml(e.title)} (${e.date})
      </option>
    `).join('');

    if (!this.activeRosterEventId && events.length > 0) {
      this.activeRosterEventId = events[0].id;
    }

    const currentEvent = window.db.getEventById(this.activeRosterEventId);
    if (currentEvent) {
      document.getElementById('rosterEventTitle').textContent = currentEvent.title;
      document.getElementById('rosterEventSubtitle').textContent = `${currentEvent.date} • ${currentEvent.venue}`;
    }

    this.renderRosterTable();
  }

  renderRosterTable() {
    const eventId = document.getElementById('rosterEventSelect')?.value || this.activeRosterEventId;
    if (!eventId) return;

    const stats = window.db.getEventStats(eventId);
    if (stats) {
      document.getElementById('rosterStatTotalReg').textContent = stats.totalRegistered;
      document.getElementById('rosterStatTotalAtt').textContent = stats.totalAttended;
      document.getElementById('rosterStatRate').textContent = `${stats.attendanceRate}%`;
    }

    let roster = window.db.getEventRosterData(eventId);

    // Filter by attendance status
    const statusFilter = document.getElementById('rosterStatusFilter')?.value || 'all';
    if (statusFilter === 'attended') {
      roster = roster.filter(r => r.status === 'Attended');
    } else if (statusFilter === 'pending') {
      roster = roster.filter(r => r.status !== 'Attended');
    }

    // Search filter
    const searchVal = document.getElementById('rosterSearchInput')?.value.trim().toLowerCase() || '';
    if (searchVal) {
      roster = roster.filter(r => 
        r.fullName.toLowerCase().includes(searchVal) ||
        r.email.toLowerCase().includes(searchVal) ||
        r.registrationId.toLowerCase().includes(searchVal)
      );
    }

    const tbody = document.getElementById('rosterTableBody');
    if (!tbody) return;

    if (roster.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
            No participant records found for this criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = roster.map(r => {
      const isAttended = r.status === 'Attended';
      const reg = window.db.getAllRegistrations().find(x => x.id === r.registrationId);
      const participantId = reg ? reg.participant_id : null;

      return `
        <tr>
          <td>
            <div style="font-weight: 600; color: #ffffff;">${this.escapeHtml(r.fullName)}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${r.organization}</div>
          </td>
          <td>${this.escapeHtml(r.email)}</td>
          <td><code class="font-mono text-cyan">${r.registrationId}</code></td>
          <td style="font-size: 0.8rem;">${r.registeredAt.substring(0, 10)}</td>
          <td>
            <span class="badge ${isAttended ? 'badge-attended' : 'badge-registered'}">
              ${isAttended ? '✓ Attended' : 'Pending Scan'}
            </span>
          </td>
          <td>
            <span style="font-size: 0.85rem; font-weight: ${isAttended ? '600' : 'normal'}; color: ${isAttended ? 'var(--success)' : 'var(--text-dim)'};">
              ${r.checkInTime}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-xs" onclick="app.toggleManualCheckIn('${eventId}', '${participantId}', '${r.registrationId}')" title="Toggle Attendance Manually">
                ${isAttended ? 'Mark Absent' : 'Verify Gate'}
              </button>
              ${isAttended ? `
                <button class="btn btn-success btn-xs" onclick="app.viewCertificateModal('${eventId}', '${participantId}')" title="Preview Issued Certificate">
                  Cert
                </button>
              ` : `
                <button class="btn btn-secondary btn-xs" onclick="app.viewTicketModal('${eventId}', '${participantId}')" title="View QR Ticket">
                  Pass
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  toggleManualCheckIn(eventId, participantId, regId) {
    if (!participantId) return;
    const res = window.db.toggleManualAttendance(eventId, participantId, regId, this.currentUser?.id);
    this.showToast(res.message, 'success');
    this.renderRosterTable();
  }

  exportCurrentEventCSV() {
    const eventId = document.getElementById('rosterEventSelect')?.value || this.activeRosterEventId;
    if (!eventId) return;
    window.db.exportAttendanceCSV(eventId);
    this.showToast('Attendance CSV roster downloaded.', 'success');
  }

  exportCurrentEventExcel() {
    const eventId = document.getElementById('rosterEventSelect')?.value || this.activeRosterEventId;
    if (!eventId) return;
    window.db.exportAttendanceExcel(eventId);
    this.showToast('Attendance Excel spreadsheet downloaded.', 'success');
  }

  // --------------------------------------------------------------------------
  // 8. ADMIN DASHBOARD
  // --------------------------------------------------------------------------
  renderAdminDashboard() {
    const stats = window.db.getSystemStats();
    document.getElementById('adminStatUsers').textContent = stats.totalUsers;
    document.getElementById('adminStatOrganizers').textContent = stats.totalOrganizers;
    document.getElementById('adminStatParticipants').textContent = stats.totalParticipants;
    document.getElementById('adminStatEvents').textContent = stats.totalEvents;
    document.getElementById('adminStatAttendance').textContent = stats.totalAttendance;

    // Render User Management Table
    const users = window.db.getAllUsers();
    const userTableBody = document.getElementById('adminUsersTableBody');
    if (userTableBody) {
      userTableBody.innerHTML = users.map(u => `
        <tr>
          <td>
            <div style="font-weight: 600; color: #ffffff;">${this.escapeHtml(u.full_name)}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${u.organization || 'General'}</div>
          </td>
          <td>${this.escapeHtml(u.email)}</td>
          <td>
            <select class="form-control form-control-sm form-select-inline" onchange="app.changeUserRole('${u.id}', this.value)">
              <option value="participant" ${u.role === 'participant' ? 'selected' : ''}>Participant</option>
              <option value="organizer" ${u.role === 'organizer' ? 'selected' : ''}>Organizer</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </td>
          <td>
            <span class="badge ${u.status === 'active' ? 'badge-attended' : 'badge-danger'}">
              ${u.status.toUpperCase()}
            </span>
          </td>
          <td style="font-size: 0.8rem;">${u.created_at.substring(0, 10)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-xs" onclick="app.toggleUserStatus('${u.id}')">
                ${u.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              ${u.id !== this.currentUser?.id ? `
                <button class="btn btn-danger btn-xs" onclick="app.confirmDeleteUser('${u.id}')">
                  Delete
                </button>
              ` : '<span style="font-size:0.75rem; color:var(--text-dim);">Current</span>'}
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Render System Activity Audit Log
    const logs = window.db.getActivityLogs();
    const logsContainer = document.getElementById('adminActivityLogs');
    if (logsContainer) {
      logsContainer.innerHTML = logs.slice(0, 15).map(l => `
        <div class="activity-log-item">
          <div class="log-time">${l.timestamp.substring(11, 19)}</div>
          <div class="log-content">
            <div class="log-action">
              <span class="log-tag">${l.action}</span>
              <span class="log-user">${l.user_email}</span>
            </div>
            <div class="log-details">${this.escapeHtml(l.details)}</div>
          </div>
        </div>
      `).join('');
    }

    // Global Events Overview
    const allEvents = window.db.getAllEvents();
    const globalEventsBody = document.getElementById('adminGlobalEventsBody');
    if (globalEventsBody) {
      globalEventsBody.innerHTML = allEvents.map(evt => {
        const eStats = window.db.getEventStats(evt.id);
        return `
          <tr>
            <td><strong>${this.escapeHtml(evt.title)}</strong></td>
            <td>${evt.organizer_name || 'Academic Host'}</td>
            <td>${evt.date}</td>
            <td>${eStats.totalRegistered} / ${evt.capacity}</td>
            <td>${eStats.totalAttended} (${eStats.attendanceRate}%)</td>
            <td>
              <button class="btn btn-secondary btn-xs" onclick="app.navigateTo('attendance', '${evt.id}')">
                View Roster
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  changeUserRole(userId, newRole) {
    try {
      window.db.updateUser(userId, { role: newRole });
      this.showToast(`User role updated to ${newRole.toUpperCase()}.`, 'success');
      this.renderAdminDashboard();
    } catch (e) {
      this.showToast(e.message, 'error');
    }
  }

  toggleUserStatus(userId) {
    const user = window.db.getUserById(userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    window.db.updateUser(userId, { status: newStatus });
    this.showToast(`User marked as ${newStatus}.`, 'info');
    this.renderAdminDashboard();
  }

  confirmDeleteUser(userId) {
    if (confirm('Are you sure you want to permanently delete this user account?')) {
      window.db.deleteUser(userId);
      this.showToast('User account deleted.', 'info');
      this.renderAdminDashboard();
    }
  }

  // --------------------------------------------------------------------------
  // 9. QR TICKET MODAL
  // --------------------------------------------------------------------------
  viewTicketModal(eventId, participantId) {
    const event = window.db.getEventById(eventId);
    const participant = window.db.getUserById(participantId);
    if (!event || !participant) return;

    let reg = window.db.getRegistrationsForEvent(eventId).find(r => r.participant_id === participantId);
    if (!reg) {
      this.showToast('No registration ticket found for this event.', 'error');
      return;
    }

    const attendance = window.db.getAttendanceRecord(eventId, participantId);
    const modal = document.getElementById('qrTicketModal');

    document.getElementById('ticketModalEventTitle').textContent = event.title;
    document.getElementById('ticketModalEventDate').textContent = `${event.date} • ${event.start_time}`;
    document.getElementById('ticketModalEventVenue').textContent = event.venue;
    document.getElementById('ticketModalParticipantName').textContent = participant.full_name;
    document.getElementById('ticketModalOrg').textContent = participant.organization || 'General';
    document.getElementById('ticketModalRegId').textContent = reg.id;
    document.getElementById('ticketModalStatus').textContent = attendance ? '✓ ATTENDANCE CONFIRMED' : 'VALID FOR ENTRY';
    document.getElementById('ticketModalStatus').className = `badge ${attendance ? 'badge-attended' : 'badge-registered'}`;
    document.getElementById('ticketModalPayload').textContent = reg.qr_code;

    // Render QR Code in modal
    setTimeout(() => {
      window.qrEngine.generateQRCode('ticketModalQrCode', reg.qr_code, 200);
    }, 50);

    // Save ticket data on modal element for PNG download action
    modal.dataset.ticketData = JSON.stringify({
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.start_time,
      eventVenue: event.venue,
      participantName: participant.full_name,
      regId: reg.id,
      status: attendance ? 'ATTENDED' : 'CONFIRMED',
      qrPayload: reg.qr_code
    });

    modal.classList.add('active');
  }

  downloadCurrentTicketImage() {
    const modal = document.getElementById('qrTicketModal');
    if (!modal || !modal.dataset.ticketData) return;

    const data = JSON.parse(modal.dataset.ticketData);
    window.qrEngine.downloadTicketImage(data);
    this.showToast('Ticket badge downloaded.', 'success');
  }

  // --------------------------------------------------------------------------
  // 10. CERTIFICATE MODAL STUDIO
  // --------------------------------------------------------------------------
  viewCertificateModal(eventId, participantId) {
    const event = window.db.getEventById(eventId);
    const participant = window.db.getUserById(participantId);
    if (!event || !participant) return;

    // Check attendance security
    const attendance = window.db.getAttendanceRecord(eventId, participantId);
    if (!attendance) {
      this.showToast('Access Denied: Certificate is only available for verified attendees.', 'error');
      return;
    }

    const certRecord = window.db.getCertificate(eventId, participantId) || window.db.issueCertificate(eventId, participantId);
    this.currentModalCertData = { event, participant, certRecord };

    const modal = document.getElementById('certModal');
    const canvas = document.getElementById('certPreviewCanvas');
    const template = document.getElementById('certTemplateSelector')?.value || event.certificate_template || 'classic-gold';

    window.certEngine.renderToCanvas(canvas, participant, event, certRecord, template);
    modal.classList.add('active');
  }

  changeCertTemplate(newTemplate) {
    if (!this.currentModalCertData) return;
    const canvas = document.getElementById('certPreviewCanvas');
    window.certEngine.renderToCanvas(
      canvas,
      this.currentModalCertData.participant,
      this.currentModalCertData.event,
      this.currentModalCertData.certRecord,
      newTemplate
    );
  }

  downloadCertPDF() {
    if (!this.currentModalCertData) return;
    window.certEngine.downloadPDF(
      this.currentModalCertData.participant,
      this.currentModalCertData.event,
      this.currentModalCertData.certRecord
    );
    window.db.logActivity(
      this.currentUser?.email || 'attendee',
      'DOWNLOAD_CERTIFICATE_PDF',
      `Downloaded PDF certificate for "${this.currentModalCertData.event.title}"`
    );
    this.showToast('Vector PDF certificate generated and downloaded.', 'success');
  }

  downloadCertPNG() {
    if (!this.currentModalCertData) return;
    window.certEngine.downloadPNG(
      this.currentModalCertData.participant,
      this.currentModalCertData.event,
      this.currentModalCertData.certRecord
    );
    this.showToast('Certificate PNG image downloaded.', 'success');
  }

  // --------------------------------------------------------------------------
  // 11. EVENT CREATION & EDITING MODAL
  // --------------------------------------------------------------------------
  openCreateEventModal() {
    document.getElementById('eventModalTitle').textContent = 'Create New Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventFormId').value = '';
    document.getElementById('eventModal').classList.add('active');
  }

  openEditEventModal(eventId) {
    const event = window.db.getEventById(eventId);
    if (!event) return;

    document.getElementById('eventModalTitle').textContent = 'Edit Event';
    document.getElementById('eventFormId').value = event.id;
    document.getElementById('eventTitleInput').value = event.title;
    document.getElementById('eventCategoryInput').value = event.category;
    document.getElementById('eventDateInput').value = event.date;
    document.getElementById('eventStartTimeInput').value = event.start_time;
    document.getElementById('eventEndTimeInput').value = event.end_time;
    document.getElementById('eventVenueInput').value = event.venue;
    document.getElementById('eventCapacityInput').value = event.capacity;
    document.getElementById('eventBannerInput').value = event.banner;
    document.getElementById('eventTemplateInput').value = event.certificate_template;
    document.getElementById('eventDescInput').value = event.description;

    document.getElementById('eventModal').classList.add('active');
  }

  saveEventForm(e) {
    e.preventDefault();
    const id = document.getElementById('eventFormId').value;
    const eventData = {
      title: document.getElementById('eventTitleInput').value,
      category: document.getElementById('eventCategoryInput').value,
      date: document.getElementById('eventDateInput').value,
      start_time: document.getElementById('eventStartTimeInput').value,
      end_time: document.getElementById('eventEndTimeInput').value,
      venue: document.getElementById('eventVenueInput').value,
      capacity: document.getElementById('eventCapacityInput').value,
      banner: document.getElementById('eventBannerInput').value || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
      certificate_template: document.getElementById('eventTemplateInput').value,
      description: document.getElementById('eventDescInput').value
    };

    if (id) {
      window.db.updateEvent(id, eventData);
      this.showToast('Event details updated successfully.', 'success');
    } else {
      window.db.createEvent(eventData, this.currentUser || { id: 'usr-org-01', full_name: 'Organizer', email: 'organizer@eventpass.edu' });
      this.showToast('New event created successfully!', 'success');
    }

    document.getElementById('eventModal').classList.remove('active');
    this.renderOrganizerDashboard();
    if (this.currentView === 'events') this.renderEventsListing();
  }

  confirmDeleteEvent(eventId) {
    const event = window.db.getEventById(eventId);
    if (!event) return;

    if (confirm(`Are you sure you want to delete "${event.title}"? All participant registrations and attendance records for this event will also be removed.`)) {
      window.db.deleteEvent(eventId);
      this.showToast('Event removed.', 'info');
      this.renderOrganizerDashboard();
    }
  }

  // --------------------------------------------------------------------------
  // 12. ADD USER MODAL (ADMIN)
  // --------------------------------------------------------------------------
  openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserModal').classList.add('active');
  }

  saveAddUser(e) {
    e.preventDefault();
    const userData = {
      full_name: document.getElementById('newUserName').value,
      email: document.getElementById('newUserEmail').value,
      password: document.getElementById('newUserPassword').value,
      role: document.getElementById('newUserRole').value,
      organization: document.getElementById('newUserOrg').value
    };

    try {
      window.db.createUser(userData);
      this.showToast(`Account created for ${userData.full_name}.`, 'success');
      document.getElementById('addUserModal').classList.remove('active');
      this.renderAdminDashboard();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // GLOBAL LISTENERS & HELPERS
  // --------------------------------------------------------------------------
  bindGlobalEvents() {
    // Close modal triggers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('active');
      });
    });

    // Event Search input listener
    const searchInput = document.getElementById('eventSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderEventsListing();
      });
    }

    // Category filter pills
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.categoryFilter = e.currentTarget.dataset.category;
        this.renderEventsListing();
      });
    });

    // Roster filter listeners
    const rosterSelect = document.getElementById('rosterEventSelect');
    if (rosterSelect) {
      rosterSelect.addEventListener('change', () => this.renderAttendanceRoster());
    }
    const rosterFilter = document.getElementById('rosterStatusFilter');
    if (rosterFilter) {
      rosterFilter.addEventListener('change', () => this.renderRosterTable());
    }
    const rosterSearch = document.getElementById('rosterSearchInput');
    if (rosterSearch) {
      rosterSearch.addEventListener('input', () => this.renderRosterTable());
    }

    // Scanner select listener
    const scanSelect = document.getElementById('scannerEventSelect');
    if (scanSelect) {
      scanSelect.addEventListener('change', () => {
        this.activeScannerEventId = scanSelect.value;
        this.updateScannerStats();
        this.populateScannerSimulator();
      });
    }

    // QR Image File Upload Scanner
    const qrFileInput = document.getElementById('scannerFileInput');
    if (qrFileInput) {
      qrFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          try {
            this.showToast('Decoding uploaded QR image...', 'info');
            const decoded = await window.qrEngine.scanFile(file);
            this.handleScanResult(decoded);
          } catch (err) {
            this.showToast('Could not find or decode a valid QR code in this image.', 'error');
          }
        }
      });
    }
  }

  showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-indicator"></div>
      <div class="toast-body">${this.escapeHtml(message)}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EventPassController();
});
