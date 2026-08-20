-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Simple policy
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('store_name', 'DapurPOS'),
  ('store_phone', '0812-3456-7890'),
  ('store_email', 'info@dapurpos.com'),
  ('store_address', 'Jakarta, Indonesia'),
  ('delivery_base_fee', '20000'),
  ('delivery_base_distance', '3'),
  ('delivery_extra_rate', '50000'),
  ('dp_percentage', '50'),
  ('low_stock_threshold', '20'),
  ('qris_image_url', 'https://qlwyfftatulvkjrnlpob.supabase.co/storage/v1/object/public/qris/WhatsApp%20Image%202026-08-20%20at%2010.05.04%20AM.jpeg'),
  ('whatsapp_number', '0812-3456-7890')
ON CONFLICT (key) DO NOTHING;
