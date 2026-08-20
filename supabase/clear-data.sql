-- Clear all data (keep tables structure)
-- Run this in Supabase SQL Editor

-- Delete all data from tables (order matters for foreign keys)
DELETE FROM inventory_log;
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM ingredients;
DELETE FROM suppliers;
DELETE FROM menu_addons;
DELETE FROM menu_protein;
DELETE FROM menu_rice;
DELETE FROM settings;
DELETE FROM users;

-- Insert admin user
INSERT INTO users (id, name, phone, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', '0812-0000-0000', 'admin@dapurpos.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Reset settings to defaults (empty)
INSERT INTO settings (key, value) VALUES
  ('store_name', ''),
  ('store_phone', ''),
  ('store_email', ''),
  ('store_address', ''),
  ('delivery_base_fee', '20000'),
  ('delivery_base_distance', '3'),
  ('delivery_extra_rate', '50000'),
  ('dp_percentage', '50'),
  ('low_stock_threshold', '20'),
  ('qris_image_url', ''),
  ('whatsapp_number', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
