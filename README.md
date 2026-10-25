# EventPass: Web-Based Event Attendance Management & Automated Certificate Generation System

> **A comprehensive academic and campus event management platform.**  
> Eliminates paper-based attendance rosters and manual certificate layout editing through encrypted QR code verification, in-browser live gate camera scanning, dynamic real-time attendance tracking, and instant personalized vector PDF certificate generation.

---

## 🌟 Key Highlights & Academic Defense Features

1. **Role-Based Access Control (3 Distinct Roles):**
   - **System Administrator:** Global user governance, role elevation, account suspension/activation, global event overview, and real-time cryptographic audit logging.
   - **Event Organizer:** Event authoring (schedule, venue, capacity, banner, cert template), participant registration oversight, live gate QR camera scanning, duplicate scan prevention, attendance roster management, and one-click **CSV & Excel (.xls)** export.
   - **Participant / Attendee:** Event directory browsing, capacity-checked one-click registration, instant personal **QR code ticket badge**, attendance status verification, and **automated personalized PDF certificate** download.

2. **Top Defense Demo Bar:**
   - Features an instant **Role Switcher** at the top of the interface allowing examiners, panelists, and students to switch instantly between **Participant (JM Demo)**, **Participant 2 (John)**, **Organizer (Prof. Navarro)**, and **Admin (System IT)** without manual re-login.

3. **In-Browser Live Gate Scanner:**
   - Uses device camera via `html5-qrcode` to scan digital or printed QR passes in real time.
   - Features dual-tone **Web Audio API** synthesized audio chimes for successful entry and duplicate check-in warnings.
   - Includes an **Interactive Attendee Test Simulator** and **Image File Upload** to demonstrate gate scanning seamlessly even if a camera is absent or denied permission.

4. **Automated Vector PDF Certificate Engine:**
   - Multi-template design studio (**Classic Gold & Ivory**, **Modern Tech Slate**, **Academic Blue Ribbon**).
   - Generates authentic, high-resolution vector PDF credentials (A4 Landscape 297mm x 210mm) via `jsPDF`, complete with participant name, event title, host signatures, date issued, unique certificate serial numbers, and verification QR seals.
   - Strictly enforced security: Only attendees with verified gate attendance can download certificates.

5. **Relational Database Structure:**
   - Client-side storage layer (`js/db.js`) maintaining complete relational integrity across 5 core tables + activity logs.
   - Full MySQL/MariaDB DDL migration script provided in [`database/schema.sql`](database/schema.sql).

---

## 👥 Pre-Configured Demo Accounts

| Role | Name | Email | Password | Status / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Participant** | Demo Student (JM) | `demo.student@student.edu` | `student` | Has attended IT Seminar (Certificate Ready!) & upcoming workshop |
| **Participant 2**| John Doe | `john.doe@student.edu` | `student` | Registered for IT Seminar (Ready for Gate Scan) |
| **Organizer** | Prof. Navarro | `organizer@eventpass.edu` | `organizer` | Hosts IT Seminar, Web Dev Workshop, Cybersecurity |
| **Admin** | System Administrator | `admin@eventpass.edu` | `admin` | Full governance & system audit logs |

*(You can also click any role pill in the top demo bar or the one-click sign-in buttons on the Login page).*

---

## 🚀 Quick Launch

Simply double-click or open [`index.html`](index.html) in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari). No build step, Node server, or external runtime required!

---

## 🔄 End-to-End System Workflow (Defense Talking Points)

1. **Event Creation:** Organizer creates an event with date, time, venue, seat capacity, banner, and chosen certificate template.
2. **Browsing & Registration:** Participant browses the directory, selects an event, and claims a slot (capacity validated).
3. **QR Pass Generation:** System issues a unique cryptographic QR ticket containing `EP-QR:[EVENT_ID]:[PARTICIPANT_ID]:[REG_ID]`. Attendee can view or download the badge as PNG.
4. **Gate Entry Verification:** Organizer opens the gate scanner, points camera at attendee's ticket (or uses the test simulator).
5. **Attendance Confirmation:** System validates ticket, prevents duplicate entry, records check-in timestamp (`HH:MM:SS AM/PM`), and plays an audio chime.
6. **Roster Tracking & Export:** Organizer monitors live attendance rates and exports records to spreadsheet-ready **CSV** and styled **Excel (.xls)** files.
7. **Certificate Issuance:** Verified attendee logs into Participant Dashboard, opens the Certificate Studio, and downloads their personalized vector **PDF certificate**.
8. **Administrative Audit:** Administrator inspects real-time logs recording event creation, registration, gate check-in, and certificate issuance.

---

## 📁 Project File Structure

```
eventpass-webapp/
├── index.html                   # Semantic HTML5 single page architecture & views
├── css/
│   └── styles.css               # Modern academic glassmorphic dark design system
├── js/
│   ├── db.js                    # Relational database layer & query methods
│   ├── qr-engine.js             # QR generation, camera scanner & audio feedback
│   ├── certificate.js           # Multi-template canvas & jsPDF vector certificate engine
│   └── app.js                   # Application state controller, auth & view routing
├── database/
│   └── schema.sql               # Production MySQL 8.0+ DDL relational schema & seeds
├── docs/                        # Project proposal and academic documentation
├── README.md                    # System documentation & defense guide
├── netlify.toml                 # Netlify deployment configuration
└── vercel.json                  # Vercel deployment configuration
```

---

## 🗄️ Database Relational Schema

The application implements the 5 core tables matching Requirement 12:

1. `users` (`id`, `full_name`, `email`, `password`, `role`, `organization`, `status`, `created_at`)
2. `events` (`id`, `organizer_id`, `title`, `description`, `category`, `date`, `start_time`, `end_time`, `venue`, `capacity`, `banner`, `certificate_template`, `created_at`)
3. `registrations` (`id`, `event_id`, `participant_id`, `qr_code`, `registered_at`, `status`)
4. `attendance` (`id`, `event_id`, `participant_id`, `registration_id`, `check_in_time`, `scanned_by`, `status`)
5. `certificates` (`id`, `event_id`, `participant_id`, `certificate_id`, `issued_at`, `certificate_file`)
6. `activity_logs` (`id`, `user_email`, `action`, `details`, `timestamp`)

Refer to [`database/schema.sql`](database/schema.sql) for the exact SQL definitions with foreign keys and indexes.
