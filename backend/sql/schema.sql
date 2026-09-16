-- IDURAR CRM/ERP MySQL schema
-- Import this file via phpMyAdmin (or `mysql` CLI) into an empty database.
-- Tables are created in dependency order; no forward references, so
-- FOREIGN_KEY_CHECKS does not need to be toggled.

CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NULL,
  photo VARCHAR(500) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'owner',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admins_email (email),
  INDEX idx_admins_removed (removed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_passwords (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  admin_id INT UNSIGNED NOT NULL,
  password VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  email_token VARCHAR(255) NULL,
  reset_token VARCHAR(255) NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  auth_type VARCHAR(50) NOT NULL DEFAULT 'email',
  UNIQUE KEY uq_admin_passwords_admin_id (admin_id),
  CONSTRAINT fk_admin_passwords_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  token VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_sessions_admin_id (admin_id),
  INDEX idx_admin_sessions_token (token(255)),
  CONSTRAINT fk_admin_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  setting_category VARCHAR(100) NOT NULL,
  setting_key VARCHAR(150) NOT NULL,
  setting_value TEXT NULL,
  value_type VARCHAR(20) NOT NULL DEFAULT 'string',
  is_private TINYINT(1) NOT NULL DEFAULT 0,
  is_core_setting TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_settings_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  country VARCHAR(100) NULL,
  address VARCHAR(500) NULL,
  email VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  assigned INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clients_removed_enabled (removed, enabled),
  INDEX idx_clients_created_by (created_by),
  CONSTRAINT fk_clients_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
  CONSTRAINT fk_clients_assigned FOREIGN KEY (assigned) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  number INT NOT NULL,
  year INT NOT NULL,
  content TEXT NULL,
  recurring VARCHAR(20) NULL,
  date DATE NOT NULL,
  expired_date DATE NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  sub_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NA',
  credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  is_overdue TINYINT(1) NOT NULL DEFAULT 0,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  pdf VARCHAR(255) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invoices_removed (removed),
  INDEX idx_invoices_client_id (client_id),
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_payment_status (payment_status),
  INDEX idx_invoices_expired_date (expired_date),
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoice_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_invoice_items_invoice_id (invoice_id),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  number INT NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  invoice_id INT UNSIGNED NOT NULL,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NA',
  ref VARCHAR(255) NULL,
  description TEXT NULL,
  pdf VARCHAR(255) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_removed (removed),
  INDEX idx_payments_invoice_id (invoice_id),
  INDEX idx_payments_client_id (client_id),
  CONSTRAINT fk_payments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
