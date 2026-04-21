-- ============================================================
-- TechBharat Store - Add users + user_carts + nav_links + mega_menu tables
-- Run this in Supabase SQL Editor if you already ran the original migration
-- ============================================================

-- Users table (stores name/email/phone visible in dashboard)
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_menu ENABLE ROW LEVEL SECURITY;

-- Users policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
