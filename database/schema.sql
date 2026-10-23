CREATE DATABASE IF NOT EXISTS iulat_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iulat_db;

CREATE TABLE IF NOT EXISTS residents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  birthdate DATE NOT NULL,
  place_of_birth VARCHAR(255) NULL,
  gender VARCHAR(40) NULL,
  civil_status VARCHAR(40) NULL,
  nationality VARCHAR(80) NOT NULL DEFAULT 'Filipino',
  complete_address TEXT NOT NULL,
  years_of_residency SMALLINT UNSIGNED NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(254) NOT NULL,
  voter_status VARCHAR(40) NULL,
  is_household_head BOOLEAN NOT NULL DEFAULT FALSE,
  family_members SMALLINT UNSIGNED NULL,
  emergency_contact_name VARCHAR(200) NULL,
  emergency_contact_number VARCHAR(20) NULL,
  emergency_relationship VARCHAR(80) NULL,
  disability_special_needs TEXT NULL,
  valid_id_type VARCHAR(80) NOT NULL,
  -- Only a bcrypt hash is stored; never store a plaintext password.
  password_hash VARCHAR(255) NOT NULL,
  terms_accepted_at DATETIME NOT NULL,
  account_status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_residents_email (email),
  UNIQUE KEY uq_residents_mobile (mobile_number),
  KEY idx_residents_status_created (account_status, created_at)
) ENGINE=InnoDB;

-- Sensitive ID images should be handled through a protected upload endpoint later.
-- Do not store uploaded ID files in a publicly served frontend folder.








-- =========================================
-- OFFICIAL ACCOUNTS
-- =========================================
CREATE TABLE IF NOT EXISTS officials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM(
    'punong_barangay',
    'secretary',
    'kagawad',
    'treasurer',
    'staff',
    'viewer'
  ) NOT NULL DEFAULT 'viewer',
  account_status ENUM(
    'pending',
    'approved',
    'rejected',
    'deactivated'
  ) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_officials_email (email),
  KEY idx_officials_status_role (account_status, role)
) ENGINE=InnoDB;


-- =========================================
-- ANNOUNCEMENTS
-- =========================================
CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM(
    'general',
    'emergency',
    'notice',
    'payout',
    'event',
    'program'
  ) NOT NULL DEFAULT 'general',
  audience ENUM('barangay', 'purok')
    NOT NULL DEFAULT 'barangay',
  audience_purok VARCHAR(100) NULL,
  status ENUM('draft', 'published', 'archived')
    NOT NULL DEFAULT 'draft',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  published_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_announcements_public (
    status, published_at, expires_at
  ),
  KEY idx_announcements_category (category),
  CONSTRAINT fk_announcements_creator
    FOREIGN KEY (created_by) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================
-- BARANGAY SERVICES
-- Permanent service information, not payouts
-- =========================================
CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NULL,
  fees VARCHAR(255) NULL,
  office_hours VARCHAR(255) NULL,
  application_location VARCHAR(255) NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_published (is_published),
  CONSTRAINT fk_services_editor
    FOREIGN KEY (updated_by) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================
-- RESIDENT ISSUE REPORTS
-- resident_id can be NULL for permitted guest
-- emergency reports.
-- =========================================
CREATE TABLE IF NOT EXISTS issue_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id BIGINT UNSIGNED NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NOT NULL,
  contact_phone VARCHAR(20) NULL,
  contact_email VARCHAR(254) NULL,
  status ENUM(
    'submitted',
    'under_review',
    'in_progress',
    'resolved',
    'closed'
  ) NOT NULL DEFAULT 'submitted',
  assigned_to BIGINT UNSIGNED NULL,
  public_reply TEXT NULL,
  replied_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_status_created (status, created_at),
  KEY idx_reports_resident (resident_id),
  KEY idx_reports_assignee (assigned_to),
  CONSTRAINT fk_reports_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_reports_assignee
    FOREIGN KEY (assigned_to) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================
-- PRIVATE INTERNAL REPORT NOTES
-- =========================================
CREATE TABLE IF NOT EXISTS report_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id BIGINT UNSIGNED NOT NULL,
  official_id BIGINT UNSIGNED NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_report_notes_report (report_id, created_at),
  CONSTRAINT fk_notes_report
    FOREIGN KEY (report_id) REFERENCES issue_reports(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notes_official
    FOREIGN KEY (official_id) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================
-- RESIDENT VERIFICATION RECORDS
-- Record verification without storing ID images.
-- =========================================
CREATE TABLE IF NOT EXISTS resident_verifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id BIGINT UNSIGNED NOT NULL,
  id_type_checked VARCHAR(80) NOT NULL,
  checked_by BIGINT UNSIGNED NULL,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_verifications_resident (resident_id),
  CONSTRAINT fk_verifications_resident
    FOREIGN KEY (resident_id) REFERENCES residents(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_verifications_official
    FOREIGN KEY (checked_by) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;


-- =========================================
-- OFFICIAL ACTIVITY LOG
-- =========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  official_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_created (created_at),
  KEY idx_activity_official (official_id),
  CONSTRAINT fk_activity_official
    FOREIGN KEY (official_id) REFERENCES officials(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;