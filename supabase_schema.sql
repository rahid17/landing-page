-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  images TEXT[] DEFAULT '{}',
  gallery TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district_id TEXT NOT NULL,
  district_name TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Districts
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Payment Settings
CREATE TABLE payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  cod JSONB NOT NULL DEFAULT '{"enabled": true}',
  bkash JSONB NOT NULL DEFAULT '{"enabled": false, "number": ""}',
  nagad JSONB NOT NULL DEFAULT '{"enabled": false, "number": ""}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  photo_url TEXT,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Landing Content
CREATE TABLE landing_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  hero JSONB NOT NULL DEFAULT '{"title": "", "subtitle": "", "cta_text": ""}',
  benefits JSONB DEFAULT '[]',
  benefits_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  features TEXT[] DEFAULT '{}',
  features_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  why_choose_us TEXT DEFAULT '',
  why_choose_us_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  gallery_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  reviews_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  faq_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  order_section JSONB DEFAULT '{"heading": "", "subheading": ""}',
  footer_content TEXT DEFAULT '',
  footer JSONB DEFAULT '{"brand_name": "", "tagline": "", "phone": "", "email": "", "address": "", "copyright": ""}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('page_view', 'cta_click', 'order')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Admins
CREATE TABLE admins (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies: Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products: anyone can read, only admin can write
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update products" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete products" ON products FOR DELETE USING (is_admin());

-- Orders: anyone can create, only admin can read/update/delete
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (is_admin());

-- Districts: anyone can read, only admin can write
CREATE POLICY "Anyone can read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Admin can insert districts" ON districts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update districts" ON districts FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete districts" ON districts FOR DELETE USING (is_admin());

-- Payment Settings: anyone can read, only admin can write
CREATE POLICY "Anyone can read payment_settings" ON payment_settings FOR SELECT USING (true);
CREATE POLICY "Admin can insert payment_settings" ON payment_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update payment_settings" ON payment_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete payment_settings" ON payment_settings FOR DELETE USING (is_admin());

-- Reviews: anyone can read, only admin can write
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Admin can insert reviews" ON reviews FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update reviews" ON reviews FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete reviews" ON reviews FOR DELETE USING (is_admin());

-- FAQs: anyone can read, only admin can write
CREATE POLICY "Anyone can read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Admin can insert faqs" ON faqs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update faqs" ON faqs FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete faqs" ON faqs FOR DELETE USING (is_admin());

-- Landing Content: anyone can read, only admin can write
CREATE POLICY "Anyone can read landing_content" ON landing_content FOR SELECT USING (true);
CREATE POLICY "Admin can insert landing_content" ON landing_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update landing_content" ON landing_content FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete landing_content" ON landing_content FOR DELETE USING (is_admin());

-- Analytics: anyone can create, only admin can read
CREATE POLICY "Anyone can create analytics" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read analytics" ON analytics FOR SELECT USING (is_admin());

-- Admins: only the admin themselves can read/write
CREATE POLICY "Admin can read own record" ON admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can insert own record" ON admins FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes for common queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_districts_active ON districts(active);
CREATE INDEX idx_analytics_type ON analytics(type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
