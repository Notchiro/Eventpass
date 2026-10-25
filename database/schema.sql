-- ============================================================================
-- EventPass: Web-Based Event Attendance Management & Certificate Generation System
-- Relational Database Schema (MySQL 8.0+ / MariaDB)
-- Designed for BSIT Academic Project & Production Deployment
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `eventpass_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `eventpass_db`;

-- ----------------------------------------------------------------------------
-- Table: users
-- Stores system users (Admins, Event Organizers, and Participants / Attendees)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'organizer', 'participant') NOT NULL DEFAULT 'participant',
  `organization` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: events
-- Stores events created by organizers
-- ----------------------------------------------------------------------------
CREATE TABLE `events` (
  `id` VARCHAR(36) NOT NULL,
  `organizer_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Seminar',
  `date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `capacity` INT UNSIGNED NOT NULL DEFAULT 100,
  `banner` VARCHAR(500) DEFAULT NULL,
  `certificate_template` VARCHAR(50) DEFAULT 'classic-gold',
  `status` ENUM('upcoming', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_events_date` (`date`),
  INDEX `idx_events_organizer` (`organizer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: registrations
-- Stores participant registrations for specific events
-- ----------------------------------------------------------------------------
CREATE TABLE `registrations` (
  `id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `participant_id` VARCHAR(36) NOT NULL,
  `qr_code` VARCHAR(255) NOT NULL UNIQUE,
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant_event` (`event_id`, `participant_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_reg_qrcode` (`qr_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: attendance
-- Records verified gate attendance when QR code is scanned
-- ----------------------------------------------------------------------------
CREATE TABLE `attendance` (
  `id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `participant_id` VARCHAR(36) NOT NULL,
  `registration_id` VARCHAR(36) NOT NULL,
  `check_in_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `scanned_by` VARCHAR(36) DEFAULT NULL,
  `status` ENUM('verified', 'flagged') NOT NULL DEFAULT 'verified',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance_registration` (`registration_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_attendance_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: certificates
-- Records issued certificates for participants with verified attendance
-- ----------------------------------------------------------------------------
CREATE TABLE `certificates` (
  `id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `participant_id` VARCHAR(36) NOT NULL,
  `certificate_id` VARCHAR(100) NOT NULL UNIQUE,
  `issued_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `certificate_file` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_participant_cert` (`event_id`, `participant_id`),
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: activity_logs
-- System-wide audit log for administrative oversight
-- ----------------------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_logs_timestamp` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Sample Demo Data Seeds
-- ============================================================================

-- Users
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `organization`, `status`) VALUES
('usr-admin-01', 'System Administrator', 'admin@eventpass.edu', '$2y$10$YourHashedPasswordHereAdmin123', 'admin', 'Campus IT Directorate', 'active'),
('usr-org-01', 'Prof. Dominic Alcantara', 'organizer@eventpass.edu', '$2y$10$YourHashedPasswordHereOrg123', 'organizer', 'College of Computer Studies', 'active'),
('usr-org-02', 'Student Leadership Council', 'council@eventpass.edu', '$2y$10$YourHashedPasswordHereCouncil123', 'organizer', 'University Supreme Student Council', 'active'),
('usr-part-01', 'Maria Clarissa Santos', 'maria.santos@student.edu', '$2y$10$YourHashedPasswordHereStudent123', 'participant', 'BS Information Technology - 3rd Year', 'active'),
('usr-part-02', 'John Doe', 'john.doe@student.edu', '$2y$10$YourHashedPasswordHereStudent123', 'participant', 'BS Computer Science - 2nd Year', 'active'),
('usr-part-03', 'Engr. Jonathan Reyes', 'jreyes@innovatecorp.com', '$2y$10$YourHashedPasswordHereGuest123', 'participant', 'Industry Partner / Guest', 'active');

-- Events
INSERT INTO `events` (`id`, `organizer_id`, `title`, `description`, `category`, `date`, `start_time`, `end_time`, `venue`, `capacity`, `banner`, `certificate_template`, `status`) VALUES
('evt-it-2026', 'usr-org-01', 'IT Seminar 2026: Future of AI & Cloud Architectures', 'An in-depth technology symposium featuring cloud computing scalability, deep learning integrations, and zero-trust security implementations for enterprise IT infrastructure.', 'Seminar', '2026-10-15', '09:00:00', '16:00:00', 'Main Campus Auditorium & Tech Hall', 250, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop', 'classic-gold', 'upcoming'),
('evt-web-2026', 'usr-org-01', 'Web Development Workshop: Modern Fullstack Engineering', 'Hands-on practical development workshop covering scalable frontend architectures, responsive UX design systems, RESTful API security, and real-time database synchronizations.', 'Workshop', '2026-10-22', '10:00:00', '15:30:00', 'CIT Computer Laboratory 401', 80, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&auto=format&fit=crop', 'modern-tech', 'upcoming'),
('evt-cyber-2026', 'usr-org-01', 'Cybersecurity Awareness Seminar: Zero Trust & Ethical Defense', 'Essential seminar addressing cybersecurity hygiene, proactive penetration testing techniques, social engineering defenses, and automated incident response protocols.', 'Seminar', '2026-10-28', '13:00:00', '17:00:00', 'Audio-Visual Center & Hybrid Stream', 180, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop', 'academic-blue', 'upcoming'),
('evt-lead-2026', 'usr-org-02', 'Student Leadership Conference 2026: Inspiring Innovation', 'Annual university-wide assembly uniting student leaders, project managers, and organizational executives to discuss team governance, ethical leadership, and innovation.', 'Conference', '2026-11-05', '08:30:00', '17:00:00', 'University Gymnasium & Grand Stage', 400, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop', 'classic-gold', 'upcoming');

-- Registrations
INSERT INTO `registrations` (`id`, `event_id`, `participant_id`, `qr_code`, `registered_at`, `status`) VALUES
('reg-001', 'evt-it-2026', 'usr-part-01', 'EP-QR:evt-it-2026:usr-part-01:reg-001', '2026-10-01 08:30:00', 'attended'),
('reg-002', 'evt-web-2026', 'usr-part-01', 'EP-QR:evt-web-2026:usr-part-01:reg-002', '2026-10-02 09:15:00', 'registered'),
('reg-003', 'evt-it-2026', 'usr-part-02', 'EP-QR:evt-it-2026:usr-part-02:reg-003', '2026-10-01 10:00:00', 'registered'),
('reg-004', 'evt-it-2026', 'usr-part-03', 'EP-QR:evt-it-2026:usr-part-03:reg-004', '2026-10-01 11:20:00', 'attended');

-- Attendance
INSERT INTO `attendance` (`id`, `event_id`, `participant_id`, `registration_id`, `check_in_time`, `scanned_by`, `status`) VALUES
('att-001', 'evt-it-2026', 'usr-part-01', 'reg-001', '2026-10-15 08:45:12', 'usr-org-01', 'verified'),
('att-002', 'evt-it-2026', 'usr-part-03', 'reg-004', '2026-10-15 08:52:40', 'usr-org-01', 'verified');

-- Certificates
INSERT INTO `certificates` (`id`, `event_id`, `participant_id`, `certificate_id`, `issued_at`, `certificate_file`) VALUES
('cert-001', 'evt-it-2026', 'usr-part-01', 'CERT-2026-IT-98214', '2026-10-15 09:00:00', 'certificates/cert-001.pdf'),
('cert-002', 'evt-it-2026', 'usr-part-03', 'CERT-2026-IT-48190', '2026-10-15 09:10:00', 'certificates/cert-002.pdf');

-- Activity Logs
INSERT INTO `activity_logs` (`user_email`, `action`, `details`) VALUES
('admin@eventpass.edu', 'SYSTEM_INITIALIZE', 'EventPass relational database tables initialized successfully.'),
('organizer@eventpass.edu', 'CREATE_EVENT', 'Created event: IT Seminar 2026: Future of AI & Cloud Architectures'),
('maria.santos@student.edu', 'EVENT_REGISTRATION', 'Registered for IT Seminar 2026 (Registration ID: reg-001)'),
('organizer@eventpass.edu', 'ATTENDANCE_CHECKIN', 'Verified QR Attendance for Maria Clarissa Santos at IT Seminar 2026'),
('maria.santos@student.edu', 'CERTIFICATE_GENERATION', 'Generated and downloaded official certificate CERT-2026-IT-98214');
