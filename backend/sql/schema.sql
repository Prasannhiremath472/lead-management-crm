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

-- ============================================================
-- Product Category / Product
-- ============================================================
CREATE TABLE product_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_categories_removed_enabled (removed, enabled),
  CONSTRAINT fk_product_categories_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  sku VARCHAR(100) NULL,
  category_id INT UNSIGNED NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NULL,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_sku (sku),
  INDEX idx_products_removed_enabled (removed, enabled),
  INDEX idx_products_category_id (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Expense Category / Expense
-- ============================================================
CREATE TABLE expense_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expense_categories_removed_enabled (removed, enabled),
  CONSTRAINT fk_expense_categories_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  category_id INT UNSIGNED NULL,
  description TEXT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  receipt VARCHAR(500) NULL,
  notes TEXT NULL,
  created_by INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expenses_removed (removed),
  INDEX idx_expenses_category_id (category_id),
  INDEX idx_expenses_date (date),
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Company (CRM entity: customer/prospect companies -- distinct from the
-- app's own "company_settings" business-profile rows in `settings`)
-- ============================================================
CREATE TABLE companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(150) NULL,
  website VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  country VARCHAR(100) NULL,
  notes TEXT NULL,
  created_by INT UNSIGNED NULL,
  assigned INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_companies_removed_enabled (removed, enabled),
  INDEX idx_companies_created_by (created_by),
  CONSTRAINT fk_companies_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
  CONSTRAINT fk_companies_assigned FOREIGN KEY (assigned) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Lead (with conversion tracking -> Client)
-- ============================================================
CREATE TABLE leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  company_name VARCHAR(255) NULL,
  company_id INT UNSIGNED NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  source VARCHAR(50) NULL,
  notes TEXT NULL,
  converted_to_client_id INT UNSIGNED NULL,
  converted_at DATETIME NULL,
  created_by INT UNSIGNED NULL,
  assigned INT UNSIGNED NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_removed_enabled (removed, enabled),
  INDEX idx_leads_status (status),
  INDEX idx_leads_created_by (created_by),
  INDEX idx_leads_company_id (company_id),
  CONSTRAINT fk_leads_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  CONSTRAINT fk_leads_converted_client FOREIGN KEY (converted_to_client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_leads_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
  CONSTRAINT fk_leads_assigned FOREIGN KEY (assigned) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Quote (+ line items) -- with conversion tracking -> Invoice
-- ============================================================
CREATE TABLE quotes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  number INT NOT NULL,
  year INT NOT NULL,
  content TEXT NULL,
  date DATE NOT NULL,
  expired_date DATE NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  sub_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NA',
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  converted_to_invoice_id INT UNSIGNED NULL,
  converted_at DATETIME NULL,
  pdf VARCHAR(255) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quotes_removed (removed),
  INDEX idx_quotes_client_id (client_id),
  INDEX idx_quotes_status (status),
  INDEX idx_quotes_expired_date (expired_date),
  CONSTRAINT fk_quotes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quotes_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quotes_converted_invoice FOREIGN KEY (converted_to_invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quote_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_quote_items_quote_id (quote_id),
  CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Offer (+ line items) -- same shape as Quote, independent entity
-- ============================================================
CREATE TABLE offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  number INT NOT NULL,
  year INT NOT NULL,
  content TEXT NULL,
  date DATE NOT NULL,
  expired_date DATE NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  sub_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NA',
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  pdf VARCHAR(255) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_offers_removed (removed),
  INDEX idx_offers_client_id (client_id),
  INDEX idx_offers_status (status),
  INDEX idx_offers_expired_date (expired_date),
  CONSTRAINT fk_offers_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_offers_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE offer_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_offer_items_offer_id (offer_id),
  CONSTRAINT fk_offer_items_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Order (+ line items referencing Products) -- has both a workflow
-- `status` and an independent `payment_status`, mirroring Invoice's
-- status/payment_status split
-- ============================================================
CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  removed TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  number INT NOT NULL,
  year INT NOT NULL,
  date DATE NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  sub_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'NA',
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  pdf VARCHAR(255) NULL,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_removed (removed),
  INDEX idx_orders_client_id (client_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_payment_status (payment_status),
  CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_order_items_order_id (order_id),
  INDEX idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
