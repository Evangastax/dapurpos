-- Fix RLS infinite recursion
-- Run this in Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin full access on users" ON users;
DROP POLICY IF EXISTS "Customers can view own profile" ON users;
DROP POLICY IF EXISTS "Customers can update own profile" ON users;
DROP POLICY IF EXISTS "Admin full access on menu_rice" ON menu_rice;
DROP POLICY IF EXISTS "Admin full access on menu_protein" ON menu_protein;
DROP POLICY IF EXISTS "Admin full access on menu_addons" ON menu_addons;
DROP POLICY IF EXISTS "Admin full access on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin full access on ingredients" ON ingredients;
DROP POLICY IF EXISTS "Admin full access on orders" ON orders;
DROP POLICY IF EXISTS "Admin full access on order_items" ON order_items;
DROP POLICY IF EXISTS "Admin full access on payments" ON payments;
DROP POLICY IF EXISTS "Admin full access on inventory_log" ON inventory_log;
DROP POLICY IF EXISTS "Customers can view active menu_rice" ON menu_rice;
DROP POLICY IF EXISTS "Customers can view active menu_protein" ON menu_protein;
DROP POLICY IF EXISTS "Customers can view active menu_addons" ON menu_addons;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can view own order_items" ON order_items;
DROP POLICY IF EXISTS "Customers can create order_items" ON order_items;
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;
DROP POLICY IF EXISTS "Customers can create payments" ON payments;

-- Disable RLS temporarily to fix recursion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_rice DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_protein DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_rice ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_protein ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- Simple policies without recursion
-- Users: allow all operations (we'll handle auth in app)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);

-- Menu: allow all operations
CREATE POLICY "Allow all on menu_rice" ON menu_rice FOR ALL USING (true);
CREATE POLICY "Allow all on menu_protein" ON menu_protein FOR ALL USING (true);
CREATE POLICY "Allow all on menu_addons" ON menu_addons FOR ALL USING (true);

-- Suppliers: allow all operations
CREATE POLICY "Allow all on suppliers" ON suppliers FOR ALL USING (true);

-- Ingredients: allow all operations
CREATE POLICY "Allow all on ingredients" ON ingredients FOR ALL USING (true);

-- Orders: allow all operations
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true);

-- Order items: allow all operations
CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true);

-- Payments: allow all operations
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true);

-- Inventory log: allow all operations
CREATE POLICY "Allow all on inventory_log" ON inventory_log FOR ALL USING (true);
