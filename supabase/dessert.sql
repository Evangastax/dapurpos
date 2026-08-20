-- Add dessert/kue menu table
CREATE TABLE IF NOT EXISTS menu_dessert (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_qty DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'pack',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menu_dessert ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on menu_dessert" ON menu_dessert FOR ALL USING (true);

-- Add packaging options table
CREATE TABLE IF NOT EXISTS packaging_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packaging_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on packaging_options" ON packaging_options FOR ALL USING (true);

-- Insert default packaging options
INSERT INTO packaging_options (name, description, price) VALUES
  ('Thinwall', 'Kemasan thinwall standar', 2000),
  ('Box Mika', 'Kemasan box mika premium', 3000),
  ('Box Kardus', 'Kemasan box kardus', 2500)
ON CONFLICT DO NOTHING;
