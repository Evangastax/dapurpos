-- DapurPOS Seed Data
-- Run after schema.sql

-- Insert admin user (password: admin123)
-- Note: Supabase Auth handles passwords, this creates the profile
INSERT INTO users (id, name, phone, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', '0812-0000-0000', 'admin@dapurpos.com', 'admin');

-- Insert sample rice options
INSERT INTO menu_rice (name, description, price, stock_qty, unit) VALUES
  ('Nasi Putih', 'Nasi putih pulen', 5000, 100, 'porsi'),
  ('Nasi Kuning', 'Nasi kuning gurih', 7000, 80, 'porsi'),
  ('Nasi Uduk', 'Nasi uduk wangi', 6000, 60, 'porsi');

-- Insert sample protein options
INSERT INTO menu_protein (name, description, price, stock_qty, unit) VALUES
  ('Ayam Goreng', 'Ayam goreng renyah', 12000, 60, 'porsi'),
  ('Ayam Laos', 'Ayam laos empuk', 13000, 45, 'porsi'),
  ('Rendang Sapi', 'Rendang sapi padang', 18000, 30, 'porsi'),
  ('Ikan Bakar', 'Ikan bakar bumbu', 15000, 25, 'porsi'),
  ('Telur Balado', 'Telur balado pedas', 8000, 50, 'porsi');

-- Insert sample addon options
INSERT INTO menu_addons (name, description, price, stock_qty, unit) VALUES
  ('Telur Dadar', 'Telur dadar tebal', 5000, 70, 'porsi'),
  ('Orek Tempe', 'Orek tempe manis', 4000, 60, 'porsi'),
  ('Sambal', 'Sambal terasi', 2000, 100, 'porsi'),
  ('Kerupuk', 'Kerupuk udang', 2000, 100, 'porsi'),
  ('Lalapan', 'Sayur segar', 3000, 50, 'porsi');

-- Insert sample suppliers
INSERT INTO suppliers (name, contact, email, address, notes) VALUES
  ('Beras Jaya', '0812-3456-7890', 'berasjaya@email.com', 'Jl. Pasar Pagi No. 15, Jakarta', 'Pengiriman setiap Senin & Kamis'),
  ('PT Ayam Segar', '0813-4567-8901', 'ayamsegar@email.com', 'Jl. Raya Bogor Km 20, Jakarta', 'Ayam potong segar setiap hari'),
  ('Telur Fresh', '0815-6789-0123', 'telurfresh@email.com', 'Jl. Industri No. 8, Tangerang', 'Telur grade A'),
  ('Bumbu Nusantara', '0816-7890-1234', 'bumbunusantara@email.com', 'Jl. Kramat No. 22, Jakarta', 'Harga bisa nego untuk pembelian banyak'),
  ('Tempe Nusantara', '0817-8901-2345', 'tempenusantara@email.com', 'Jl. Kebon Jeruk No. 11, Jakarta', 'Produksi sendiri, tanpa pengawet');

-- Insert sample ingredients
INSERT INTO ingredients (name, unit, stock_qty, min_stock_alert, supplier_id, cost_per_unit) VALUES
  ('Beras Putih', 'kg', 25, 10, (SELECT id FROM suppliers WHERE name = 'Beras Jaya'), 15000),
  ('Beras Kuning', 'kg', 15, 5, (SELECT id FROM suppliers WHERE name = 'Beras Jaya'), 18000),
  ('Ayam', 'kg', 15, 20, (SELECT id FROM suppliers WHERE name = 'PT Ayam Segar'), 45000),
  ('Telur', 'butir', 200, 50, (SELECT id FROM suppliers WHERE name = 'Telur Fresh'), 2500),
  ('Tempe', 'papan', 30, 10, (SELECT id FROM suppliers WHERE name = 'Tempe Nusantara'), 5000),
  ('Cabai', 'kg', 5, 3, (SELECT id FROM suppliers WHERE name = 'Bumbu Nusantara'), 35000),
  ('Minyak Goreng', 'liter', 20, 5, (SELECT id FROM suppliers WHERE name = 'Bumbu Nusantara'), 18000),
  ('Kerupuk', 'pack', 50, 15, (SELECT id FROM suppliers WHERE name = 'Bumbu Nusantara'), 8000),
  ('Sambal', 'pack', 5, 10, (SELECT id FROM suppliers WHERE name = 'Bumbu Nusantara'), 12000);
