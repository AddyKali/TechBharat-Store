-- ============================================================
-- TechBharat Store - Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: SQL Editor → New Query → Paste this → Run
-- ============================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT,
  category TEXT,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  badge TEXT,
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT,
  product_count INTEGER DEFAULT 0,
  subcategories JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero sections table
CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  cta_primary_text TEXT DEFAULT 'Shop Now',
  cta_primary_link TEXT DEFAULT '#',
  cta_secondary_text TEXT DEFAULT 'View Deals',
  cta_secondary_link TEXT DEFAULT '#',
  background_image TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo banners table
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  label TEXT,
  emoji TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '#',
  bg_type TEXT DEFAULT 'gradient-hero',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_name TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (stores name/email/phone visible in Supabase dashboard)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User carts table (per-user persistent cart)
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation links table
CREATE TABLE IF NOT EXISTS nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '#',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mega menu table
CREATE TABLE IF NOT EXISTS mega_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security (RLS) with public read access
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_menu ENABLE ROW LEVEL SECURITY;

-- Public read policies (for storefront)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read hero_sections" ON hero_sections FOR SELECT USING (true);
CREATE POLICY "Public read promo_banners" ON promo_banners FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Full access for service role (used by backend server)
CREATE POLICY "Service insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Service delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Service insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Service delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Service insert hero_sections" ON hero_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update hero_sections" ON hero_sections FOR UPDATE USING (true);
CREATE POLICY "Service delete hero_sections" ON hero_sections FOR DELETE USING (true);

CREATE POLICY "Service insert promo_banners" ON promo_banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update promo_banners" ON promo_banners FOR UPDATE USING (true);
CREATE POLICY "Service delete promo_banners" ON promo_banners FOR DELETE USING (true);

CREATE POLICY "Service insert coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update coupons" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Service delete coupons" ON coupons FOR DELETE USING (true);

CREATE POLICY "Service insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update site_settings" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Service delete site_settings" ON site_settings FOR DELETE USING (true);

CREATE POLICY "Service insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Service delete orders" ON orders FOR DELETE USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- Users table policies
CREATE POLICY "Service insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Service delete users" ON users FOR DELETE USING (true);
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);

-- User carts policies
CREATE POLICY "Service insert user_carts" ON user_carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update user_carts" ON user_carts FOR UPDATE USING (true);
CREATE POLICY "Service delete user_carts" ON user_carts FOR DELETE USING (true);
CREATE POLICY "Public read user_carts" ON user_carts FOR SELECT USING (true);

-- Nav links policies
CREATE POLICY "Service insert nav_links" ON nav_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update nav_links" ON nav_links FOR UPDATE USING (true);
CREATE POLICY "Service delete nav_links" ON nav_links FOR DELETE USING (true);
CREATE POLICY "Public read nav_links" ON nav_links FOR SELECT USING (true);

-- Mega menu policies
CREATE POLICY "Service insert mega_menu" ON mega_menu FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update mega_menu" ON mega_menu FOR UPDATE USING (true);
CREATE POLICY "Service delete mega_menu" ON mega_menu FOR DELETE USING (true);
CREATE POLICY "Public read mega_menu" ON mega_menu FOR SELECT USING (true);

-- ============================================================
-- Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Done! Now go to the admin panel and click "Initialize / Seed DB" to populate with sample data.
