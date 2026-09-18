-- Seed data for the 9 new entities (Quote, Offer, Product, ProductCategory,
-- Lead, Company, Expense, ExpenseCategory, Order).
-- Safe to run on top of an existing database: looks up the first admin
-- dynamically rather than hardcoding an id, and creates its own demo
-- client if none exists yet.

SET @admin_id = (SELECT id FROM admins WHERE removed = 0 ORDER BY id LIMIT 1);

-- Ensure at least one client exists to attach quotes/offers/orders to.
INSERT INTO clients (removed, enabled, name, phone, country, address, email, created_by)
SELECT 0, 1, 'Demo Client', '555-0100', 'United States', '1 Demo Street', 'demo.client@example.com', @admin_id
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE removed = 0 LIMIT 1);

SET @client_id = (SELECT id FROM clients WHERE removed = 0 ORDER BY id LIMIT 1);

-- ============================================================
-- Product Categories
-- ============================================================
INSERT INTO product_categories (removed, enabled, name, description, created_by) VALUES
(0, 1, 'Electronics', 'Electronic devices and accessories', @admin_id),
(0, 1, 'Office Supplies', 'Office and stationery items', @admin_id),
(0, 1, 'Software', 'Software licenses and subscriptions', @admin_id);

SET @cat_electronics = (SELECT id FROM product_categories WHERE name = 'Electronics' ORDER BY id DESC LIMIT 1);
SET @cat_office = (SELECT id FROM product_categories WHERE name = 'Office Supplies' ORDER BY id DESC LIMIT 1);
SET @cat_software = (SELECT id FROM product_categories WHERE name = 'Software' ORDER BY id DESC LIMIT 1);

-- ============================================================
-- Products
-- ============================================================
INSERT INTO products (removed, enabled, name, description, sku, category_id, price, quantity, unit, tax_rate, created_by) VALUES
(0, 1, 'Laptop Pro 15"', '15-inch business laptop', 'SKU-LAP-001', @cat_electronics, 1299.99, 25, 'unit', 8, @admin_id),
(0, 1, 'Wireless Mouse', 'Ergonomic wireless mouse', 'SKU-MOU-001', @cat_electronics, 29.99, 150, 'unit', 8, @admin_id),
(0, 1, 'A4 Paper Ream', '500 sheets, 80gsm', 'SKU-PAP-001', @cat_office, 6.50, 500, 'ream', 5, @admin_id),
(0, 1, 'Stapler', 'Standard desktop stapler', 'SKU-STA-001', @cat_office, 8.25, 80, 'unit', 5, @admin_id),
(0, 1, 'CRM License (Annual)', 'Per-seat annual subscription', 'SKU-SFT-001', @cat_software, 199.00, 999, 'seat', 0, @admin_id);

SET @product_laptop = (SELECT id FROM products WHERE sku = 'SKU-LAP-001' ORDER BY id DESC LIMIT 1);
SET @product_mouse = (SELECT id FROM products WHERE sku = 'SKU-MOU-001' ORDER BY id DESC LIMIT 1);

-- ============================================================
-- Expense Categories
-- ============================================================
INSERT INTO expense_categories (removed, enabled, name, description, created_by) VALUES
(0, 1, 'Travel', 'Business travel expenses', @admin_id),
(0, 1, 'Utilities', 'Electricity, internet, phone bills', @admin_id),
(0, 1, 'Marketing', 'Advertising and promotional spend', @admin_id);

SET @exp_cat_travel = (SELECT id FROM expense_categories WHERE name = 'Travel' ORDER BY id DESC LIMIT 1);
SET @exp_cat_utilities = (SELECT id FROM expense_categories WHERE name = 'Utilities' ORDER BY id DESC LIMIT 1);
SET @exp_cat_marketing = (SELECT id FROM expense_categories WHERE name = 'Marketing' ORDER BY id DESC LIMIT 1);

-- ============================================================
-- Expenses
-- ============================================================
INSERT INTO expenses (removed, category_id, description, amount, date, notes, created_by) VALUES
(0, @exp_cat_travel, 'Flight to client site', 450.00, CURDATE() - INTERVAL 20 DAY, 'Round trip, economy', @admin_id),
(0, @exp_cat_utilities, 'Office internet bill', 89.99, CURDATE() - INTERVAL 15 DAY, 'Monthly recurring', @admin_id),
(0, @exp_cat_marketing, 'Social media ad campaign', 300.00, CURDATE() - INTERVAL 10 DAY, 'Q3 campaign', @admin_id),
(0, @exp_cat_travel, 'Client dinner', 120.00, CURDATE() - INTERVAL 5 DAY, NULL, @admin_id);

-- ============================================================
-- Companies
-- ============================================================
INSERT INTO companies (removed, enabled, name, industry, website, email, phone, address, country, created_by) VALUES
(0, 1, 'Globex Corporation', 'Manufacturing', 'https://globex.example.com', 'contact@globex.example.com', '555-0200', '100 Industrial Way', 'United States', @admin_id),
(0, 1, 'Initech Solutions', 'Software', 'https://initech.example.com', 'info@initech.example.com', '555-0201', '200 Tech Park', 'United States', @admin_id),
(0, 1, 'Umbrella Retail', 'Retail', 'https://umbrella.example.com', 'sales@umbrella.example.com', '555-0202', '300 Commerce Blvd', 'Canada', @admin_id);

SET @company_globex = (SELECT id FROM companies WHERE name = 'Globex Corporation' ORDER BY id DESC LIMIT 1);
SET @company_initech = (SELECT id FROM companies WHERE name = 'Initech Solutions' ORDER BY id DESC LIMIT 1);

-- ============================================================
-- Leads
-- ============================================================
INSERT INTO leads (removed, enabled, name, email, phone, company_name, company_id, status, source, notes, created_by) VALUES
(0, 1, 'Sarah Connor', 'sarah.connor@globex.example.com', '555-0300', 'Globex Corporation', @company_globex, 'new', 'website', 'Requested a demo via contact form', @admin_id),
(0, 1, 'Mike Ross', 'mike.ross@initech.example.com', '555-0301', 'Initech Solutions', @company_initech, 'contacted', 'referral', 'Referred by existing client', @admin_id),
(0, 1, 'Dana Scully', 'dana.scully@umbrella.example.com', '555-0302', 'Umbrella Retail', NULL, 'qualified', 'cold-call', 'Interested in bulk pricing', @admin_id),
(0, 1, 'Fox Mulder', 'fox.mulder@example.com', '555-0303', NULL, NULL, 'lost', 'social', 'Went with a competitor', @admin_id);

-- ============================================================
-- Quotes (+ items)
-- ============================================================
INSERT INTO quotes (removed, created_by, number, year, content, date, expired_date, client_id, tax_rate, sub_total, tax_total, total, currency, discount, notes, status, pdf) VALUES
(0, @admin_id, 1, YEAR(CURDATE()), 'Initial proposal', CURDATE(), CURDATE() + INTERVAL 30 DAY, @client_id, 8, 1329.98, 106.40, 1436.38, 'USD', 0, 'Includes laptop + mouse bundle', 'sent', NULL);

SET @quote_id = LAST_INSERT_ID();

INSERT INTO quote_items (quote_id, item_name, description, quantity, price, total, sort_order) VALUES
(@quote_id, 'Laptop Pro 15"', '15-inch business laptop', 1, 1299.99, 1299.99, 0),
(@quote_id, 'Wireless Mouse', 'Ergonomic wireless mouse', 1, 29.99, 29.99, 1);

UPDATE quotes SET pdf = CONCAT('quote-', @quote_id, '.pdf') WHERE id = @quote_id;

-- ============================================================
-- Offers (+ items)
-- ============================================================
INSERT INTO offers (removed, created_by, number, year, content, date, expired_date, client_id, tax_rate, sub_total, tax_total, total, currency, discount, notes, status, pdf) VALUES
(0, @admin_id, 1, YEAR(CURDATE()), 'Limited-time bundle discount', CURDATE(), CURDATE() + INTERVAL 14 DAY, @client_id, 5, 199.00, 9.95, 208.95, 'USD', 20.00, 'Annual CRM license promo', 'draft', NULL);

SET @offer_id = LAST_INSERT_ID();

INSERT INTO offer_items (offer_id, item_name, description, quantity, price, total, sort_order) VALUES
(@offer_id, 'CRM License (Annual)', 'Per-seat annual subscription', 1, 199.00, 199.00, 0);

UPDATE offers SET pdf = CONCAT('offer-', @offer_id, '.pdf') WHERE id = @offer_id;

-- ============================================================
-- Orders (+ items, referencing real Products)
-- ============================================================
INSERT INTO orders (removed, created_by, number, year, date, client_id, tax_rate, sub_total, tax_total, total, currency, discount, credit, notes, status, payment_status, pdf) VALUES
(0, @admin_id, 1, YEAR(CURDATE()), CURDATE(), @client_id, 8, 1359.97, 108.80, 1468.77, 'USD', 0, 0, 'First bulk order', 'processing', 'unpaid', NULL);

SET @order_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, item_name, description, quantity, price, total, sort_order) VALUES
(@order_id, @product_laptop, 'Laptop Pro 15"', '15-inch business laptop', 1, 1299.99, 1299.99, 0),
(@order_id, @product_mouse, 'Wireless Mouse', 'Ergonomic wireless mouse', 2, 29.99, 59.98, 1);

UPDATE orders SET pdf = CONCAT('order-', @order_id, '.pdf') WHERE id = @order_id;
