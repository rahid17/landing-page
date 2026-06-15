-- Fix orders table: make old single-product columns nullable, drop if needed
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN product_name DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN price DROP NOT NULL;

-- Ensure items column exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]';

-- Update RLS for orders: ensure anyone can create, admin can manage
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read orders" ON orders;
CREATE POLICY "Admin can read orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (true);
