-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  time_ago TEXT DEFAULT 'a month ago',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);

-- ============================================
-- FOOTER LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'Shop',
  label TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT '#',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read footer_links" ON footer_links FOR SELECT USING (true);

-- ============================================
-- SEED DEFAULT TESTIMONIALS
-- ============================================
INSERT INTO testimonials (name, rating, review, time_ago, sort_order) VALUES
  ('Jaisimha A G', 5, 'A pretty well organized warehouse for most hobby electronic components and modules. Your online shopping experience is comfortable and convenient', 'a month ago', 1),
  ('Anirban Bandyopadhyay', 5, 'With the price, service, and guidance, TechBharat is a complete package for your needs', 'a month ago', 2),
  ('Varun Wahi', 5, 'Great customer service. I am very impressed with the quick replies and actions to all my queries.', '3 weeks ago', 3);

-- ============================================
-- SEED DEFAULT FOOTER LINKS
-- ============================================
INSERT INTO footer_links (section, label, href, sort_order) VALUES
  ('Shop', 'Arduino', '/products?category=arduino', 1),
  ('Shop', 'Raspberry Pi', '/products?category=raspberry-pi', 2),
  ('Shop', 'Drone Parts', '/products?category=drone-parts', 3),
  ('Shop', '3D Printing', '/products?category=3d-printing', 4),
  ('Shop', 'EV Components', '/products?category=ev-components', 5),
  ('Shop', 'Sensors', '/products?category=sensors', 6),
  ('Support', 'Help Center', '/help', 1),
  ('Support', 'Track Order', '/track-order', 2),
  ('Support', 'Shipping Info', '/shipping', 3),
  ('Support', 'Returns', '/returns', 4),
  ('Support', 'Warranty', '/warranty', 5),
  ('Support', 'Contact Us', '/contact', 6),
  ('Company', 'About Us', '/about', 1),
  ('Company', 'Careers', '/careers', 2),
  ('Company', 'Blog', '/blog', 3),
  ('Company', 'Press', '/press', 4),
  ('Company', 'Partners', '/partners', 5),
  ('Company', 'Affiliates', '/affiliates', 6);
