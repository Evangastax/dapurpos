-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'maincourse';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packaging_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packaging_fee DECIMAL(10,2) DEFAULT 0;
