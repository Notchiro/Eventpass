# PROJECT PROPOSAL

**Project Title:**  
### **EventPass IT: A Web-Based Event Attendance Management and Automated Technical Credential System for Information Technology & Computing**

---

### **1. PROJECT METADATA & PROPONENT INFORMATION**

| Field | Detail |
| :--- | :--- |
| **Project Title** | EventPass IT: Web-Based Event Attendance & Automated IT Certificate System |
| **Proponent(s)** | [Student Name / Capstone Team Members] |
| **Degree / Program** | Bachelor of Science in Information Technology (BSIT) / Computer Science |
| **Course / Subject** | Capstone Project / Software Engineering & Applied IT Development |
| **Date of Submission** | September 2026 |
| **Target Beneficiaries** | College of Information Technology, IT Student Guilds, Technical Symposiums, Hackathons |
| **Proposed Platform** | **Web Application (Responsive / Progressive Web Architecture)** |

#### **Platform Justification:**
A responsive web application is inherently cross-platform, enabling IT participants and event personnel to access the system instantly from any web browser on smartphones (Android, iOS), tablets, and desktop workstations. It eliminates the friction of requiring users to download and install native apps from app stores. For gatekeepers, any camera-equipped laptop or phone can instantly double as an entrance gate scanner without specialized hardware.

---

### **2. PROJECT DESCRIPTION & BACKGROUND OF THE STUDY**

Organizing institutional, academic, and professional gatherings—such as symposiums, technical workshops, leadership conferences, and general assemblies—involves significant logistical overhead. Across high schools, universities, and corporate environments, two major bottlenecks routinely undermine operational efficiency:

1. **Manual Attendance Tracking Inefficiencies:**
   Traditional check-in relies heavily on printed sign-in sheets or manual spreadsheet logging. This practice generates slow-moving entrance queues, illegible attendee handwriting, proxy sign-ins (students signing on behalf of absent peers), and lost or damaged paper logs. Post-event data reconciliation can consume hours or days.

2. **Delayed and Labor-Intensive Certificate Distribution:**
   Issuing Certificates of Participation or Completion traditionally requires organizers to manually populate names on graphic design templates, export individual documents, and send them one-by-one via email. Consequently, attendees often wait weeks to receive credentials, and administrators face numerous complaints regarding misspelled names or lost emails.

**EventPass** addresses these pain points through a unified, self-service web application. By pairing automated cryptographic QR pass generation at registration with live camera-based gate scanning and an instantaneous, on-demand client-side PDF certificate generator, EventPass modernizes the entire event lifecycle from sign-up to post-event accreditation.

---

### **3. OBJECTIVES OF THE STUDY**

#### **General Objective:**
To design, develop, and deploy a secure, web-based event attendance management and automated certificate distribution system that eliminates manual registration queues, prevents unauthorized sign-ins, and delivers verifiable digital certificates in real time.

#### **Specific Objectives:**
1. **Automate Pre-Registration & Pass Issuance:** Allow participants to register online and instantly obtain a personalized digital event pass with an encrypted QR token.
2. **Implement Real-Time QR Gate Scanning:** Provide an in-browser camera scanner capable of scanning attendee QR codes in under 1 second to verify validity and log attendance with exact timestamps.
3. **Prevent Duplicate & Fraudulent Check-Ins:** Enforce stateful token validation to flag and reject duplicate check-in attempts or counterfeit passes.
4. **Develop an On-Demand Dynamic Certificate Engine:** Enable verified attendees to download high-resolution, vector-quality PDF certificates rendered on demand with personalized credentials and verification QR watermarks.
5. **Deliver Actionable Analytics & Data Portability:** Provide organizers with a live administrative dashboard tracking turnout metrics, registration-to-attendance ratios, and instantaneous one-click CSV/Excel roster exports.

---

### **4. SCOPE AND DELIMITATIONS**

#### **Scope (What the System Covers):**
* **Self-Service Registration:** Intuitive web portal where participants enter identifying details (Name, Email, Institution/ID, Affiliation).
* **Cryptographic Pass Generation:** Automated generation of scannable QR tokens containing unique hashed credentials.
* **Universal Camera Scanner:** In-browser barcode/QR reader utilizing standard device webcams and phone rear cameras without third-party app installations.
* **Manual Verification Fallback:** Emergency token search and manual check-in toggle for participants with low battery or broken phone screens.
* **Dynamic Certificate Generation:** Instant client-side PDF document rendering featuring customized event title, attendee name, completion date, authorized signatory stamps, and verification QR code.
* **Organizer Dashboard:** Visual metrics for total registrations, confirmed attendees, absentee count, and turnout percentage.
* **Data Export:** Complete attendance roster export in CSV format for institutional reporting.

#### **Delimitations (What is Excluded):**
* The initial version is focused on single-organization or hosted institutional events and does not process paid ticket transactions (e.g., credit card payment gateways).
* Physical RFID/NFC hardware cards are not included; the system is optimized for zero-cost digital QR displays on smartphone screens or paper printouts.

---

### **5. SYSTEM ARCHITECTURE & CORE MODULES**

```
+-------------------------------------------------------------------------+
|                               EVENTPASS                                 |
+-------------------------------------------------------------------------+
       |                                                 |
       v                                                 v
 [Attendee Portal]                              [Organizer Console]
       |                                                 |
       +---> Registration Form                           +---> Live Turnout Analytics
       +---> Instant QR Pass Display                     +---> Web Camera Scanner
       +---> Download / Print Ticket                     +---> Manual Roster Overrides
       +---> On-Demand Certificate Download              +---> CSV / Excel Data Export
```

#### **Module Breakdown:**
| # | Module Name | Primary Responsibility |
| :---: | :--- | :--- |
| **1** | **User Registration Module** | Captures attendee info, validates fields, and creates a persistent record. |
| **2** | **QR Token & Pass Generator** | Generates a unique, high-contrast QR matrix linked to the attendee record. |
| **3** | **Live Web Scanner Module** | Decodes QR codes using device video feeds with millisecond latency. |
| **4** | **Validation & Anti-Fraud Engine**| Confirms pass legitimacy, stamps check-in time, and blocks repeat scans. |
| **5** | **Dynamic Certificate Engine** | Generates high-resolution PDF certificates on-the-fly with custom branding. |
| **6** | **Analytics & Roster Manager** | Renders summary KPI cards, filtered tables, and raw data export files. |

---

### **6. TECHNICAL SPECIFICATIONS**

* **User Interface & Styling:** Semantic HTML5, Custom Responsive Design System (Vanilla CSS with CSS variables, Glassmorphism, Dark Mode, Micro-animations, Google Fonts Outfit & Inter).
* **Client-Side Application Logic:** Modern ES6+ JavaScript (Modular State Architecture, Event Delegation, LocalStorage Data Persistence).
* **QR Processing Engines:** 
  * Generation: Canvas-based QR Code Generator (`QRCode.js`).
  * Scanning: In-browser camera decoding pipeline (`Html5-QRCode`).
* **Document Generation Engine:** Client-side vector PDF renderer (`jsPDF`) and HTML5 2D Canvas rendering for high-DPI printable certificates.
* **Compatibility:** Tested and responsive across modern Chromium browsers (Google Chrome, Microsoft Edge, Brave), Mozilla Firefox, and Apple Safari (iOS & macOS).

---

### **7. WORK BREAKDOWN & TIMELINE (9-WEEK SCHEDULE)**

| Phase | Milestone / Activity | Duration | Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | Requirements Gathering & UI/UX Wireframing | Weeks 1–2 | System requirements specification, mockups, design tokens |
| **Phase 2** | Architecture Setup & Registration Portal | Weeks 3–4 | Attendee registration form, data storage, pass rendering |
| **Phase 3** | Scanner Integration & Dynamic Certificate Engine | Weeks 5–6 | Camera scanning pipeline, PDF certificate generator |
| **Phase 4** | Organizer Dashboard & Analytics Integration | Weeks 7–8 | Turnout metrics, table filters, CSV export, validation testing |
| **Phase 5** | Final Polish, Security Checks & Capstone Defense | Week 9 | User acceptance testing, live deployment, presentation |

---

### **8. EXPECTED IMPACT & SIGNIFICANCE**

1. **For Educational & Academic Institutions:** Drastically accelerates entry flow for large campus convocations and accreditation symposiums, eliminating crowds and manual paperwork.
2. **For Event Organizers:** Reduces post-event administrative burden by up to 95%, as certificates are delivered instantly upon attendance confirmation rather than through manual email campaigns.
3. **For Attendees:** Provides a seamless, modern experience with immediate proof of attendance and instantaneous credential collection for portfolios and LinkedIn.
