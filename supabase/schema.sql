-- DapurPOS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu: Rice bases
CREATE TABLE menu_rice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_qty DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'porsi',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu: Proteins
CREATE TABLE menu_protein (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_qty DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'porsi',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu: Add-ons
CREATE TABLE menu_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_qty DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'porsi',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients (for inventory tracking)
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock_qty DECIMAL(10,2) DEFAULT 0,
  min_stock_alert DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id),
  cost_per_unit DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  rice_id UUID REFERENCES menu_rice(id),
  rice_name TEXT NOT NULL,
  rice_price DECIMAL(10,2) NOT NULL,
  combo_price DECIMAL(10,2) NOT NULL,
  pack_qty INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_type TEXT CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_distance_km DECIMAL(5,2),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  time_slot TEXT CHECK (time_slot IN ('pagi', 'siang', 'sore')),
  delivery_date DATE NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL,
  dp_amount DECIMAL(10,2) NOT NULL,
  dp_paid_at TIMESTAMPTZ,
  dp_payment_proof TEXT,
  remaining_amount DECIMAL(10,2),
  remaining_paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'awaiting_dp' CHECK (status IN (
    'awaiting_dp',
    'dp_confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'picked_up',
    'delivered',
    'done',
    'cancelled'
  )),
  cancel_deadline DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items (proteins + addons)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('protein', 'addon')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  payment_type TEXT CHECK (payment_type IN ('dp', 'remaining')),
  amount DECIMAL(10,2) NOT NULL,
  method TEXT DEFAULT 'qris',
  proof_url TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory log
CREATE TABLE inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID REFERENCES ingredients(id),
  change_qty DECIMAL(10,2) NOT NULL,
  reason TEXT CHECK (reason IN ('order', 'manual', 'restock', 'adjustment')),
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_inventory_log_ingredient_id ON inventory_log(ingredient_id);

-- Create function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_rice_updated_at BEFORE UPDATE ON menu_rice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_protein_updated_at BEFORE UPDATE ON menu_protein FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_addons_updated_at BEFORE UPDATE ON menu_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
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

-- Policies for admin (full access)
CREATE POLICY "Admin full access on users" ON users FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on menu_rice" ON menu_rice FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on menu_protein" ON menu_protein FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on menu_addons" ON menu_addons FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on suppliers" ON suppliers FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on ingredients" ON ingredients FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on orders" ON orders FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on order_items" ON order_items FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on payments" ON payments FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Admin full access on inventory_log" ON inventory_log FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Policies for customers (limited access)
CREATE POLICY "Customers can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Customers can view active menu_rice" ON menu_rice FOR SELECT USING (is_active = true);
CREATE POLICY "Customers can view active menu_protein" ON menu_protein FOR SELECT USING (is_active = true);
CREATE POLICY "Customers can view active menu_addons" ON menu_addons FOR SELECT USING (is_active = true);
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Customers can view own order_items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Customers can create order_items" ON order_items FOR INSERT WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Customers can view own payments" ON payments FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Customers can create payments" ON payments FOR INSERT WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
