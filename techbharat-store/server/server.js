import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env — try project root first, then git repo root (one level up)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client with service role (admin privileges)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️  Supabase not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  console.warn('   Admin login will work, but database features will be unavailable.');
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    // Allow any localhost origin and Vercel deployments
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/) || origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for file uploads (memory storage for Supabase upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ============ ADMIN AUTH MIDDLEWARE ============
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techbharat.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TechBharat@2026';

// Guard middleware: ensures Supabase is configured before hitting DB routes
const requireDB = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env' });
  }
  next();
};

const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token === Buffer.from(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).toString('base64')) {
    requireDB(req, res, next);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ============ ADMIN LOGIN ============
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${email}:${password}`).toString('base64');
    res.json({ success: true, token, admin: { email, name: 'Admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Guard all DB-dependent API routes (login and health don't need DB)
app.use('/api', (req, res, next) => {
  if (req.path === '/admin/login' || req.path === '/health') return next();
  requireDB(req, res, next);
});

// ============ INIT DB (Seed Data) ============
app.post('/api/admin/init-db', adminAuth, async (req, res) => {
  try {
    // Check if tables exist by attempting a query
    const { error: checkError } = await supabase.from('products').select('id').limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      return res.status(400).json({
        error: 'Tables not found. Please run the SQL migration first in the Supabase SQL Editor. See server/supabase-migration.sql'
      });
    }

    // Seed default data if tables are empty
    const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
    if (!existingProducts || existingProducts.length === 0) {
      await seedDefaultData();
    } else {
      return res.json({ success: true, message: 'Database already has data. Skipping seed.' });
    }

    res.json({ success: true, message: 'Database seeded with sample data!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function seedDefaultData() {
  // Seed products
  const products = [
    { name: "Arduino Mega 2560 Rev3", price: 2999, original_price: 3499, image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=400&fit=crop", category: "Arduino", rating: 4.8, reviews: 342, badge: "Bestseller", in_stock: true, featured: true },
    { name: "Raspberry Pi 5 - 8GB", price: 7499, original_price: null, image: "https://robocraze.com/cdn/shop/files/Raspberry_Pi_4_8GB_RAM_1000x.webp?v=1744783340", category: "Raspberry Pi", rating: 4.9, reviews: 218, badge: "New", in_stock: true, featured: true },
    { name: "DJI F450 Drone Frame Kit", price: 4599, original_price: 5299, image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop", category: "Drone Parts", rating: 4.6, reviews: 89, badge: null, in_stock: true, featured: true },
    { name: "Creality Ender 3 V3 SE", price: 18999, original_price: 22999, image: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?w=400&h=400&fit=crop", category: "3D Printing", rating: 4.7, reviews: 156, badge: "Deal", in_stock: true, featured: true },
    { name: "48V 20Ah Li-Ion Battery Pack", price: 12499, original_price: null, image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSHzYlfRPSAF1NG1jQg5yJkxq4iXnFgGSJMnr6DaLWIWfGRPpxgm9BacULRW5xW2onuijV1FB7rTRSd3UwREyLzNnLcyirsox2FmKL53LLij7DGSDkcCQoS", category: "EV Components", rating: 4.5, reviews: 67, badge: null, in_stock: true, featured: true },
    { name: "MPU6050 6-Axis Gyroscope", price: 299, original_price: 449, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop", category: "Sensors", rating: 4.4, reviews: 523, badge: null, in_stock: true, featured: true },
    { name: "Hakko FX-888D Soldering Station", price: 8999, original_price: null, image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop", category: "Tools", rating: 4.9, reviews: 201, badge: "Top Rated", in_stock: true, featured: true },
    { name: "ESP32 Dev Board (30-pin)", price: 549, original_price: 749, image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop", category: "Arduino", rating: 4.7, reviews: 891, badge: "Hot", in_stock: true, featured: true },
  ];
  await supabase.from('products').insert(products);

  // Seed categories
  const categories = [
    { name: "Arduino", slug: "arduino", icon: "🔧", product_count: 245, subcategories: ["Boards", "Shields", "Sensors", "Modules"], sort_order: 1 },
    { name: "Raspberry Pi", slug: "raspberry-pi", icon: "🍓", product_count: 132, subcategories: ["Boards", "HATs", "Cases", "Accessories"], sort_order: 2 },
    { name: "Drone Parts", slug: "drone-parts", icon: "🚁", product_count: 189, subcategories: ["Kits", "Motors", "Controllers", "Propellers", "ESCs"], sort_order: 3 },
    { name: "3D Printing", slug: "3d-printing", icon: "🖨️", product_count: 97, subcategories: ["Printers", "Filaments", "Parts", "Tools"], sort_order: 4 },
    { name: "EV Components", slug: "ev-parts", icon: "⚡", product_count: 156, subcategories: ["Motors", "Batteries", "Controllers", "Chargers"], sort_order: 5 },
    { name: "Sensors", slug: "sensors", icon: "📡", product_count: 312, subcategories: ["Temperature", "Motion", "Proximity", "Gas", "Light"], sort_order: 6 },
    { name: "Batteries", slug: "batteries", icon: "🔋", product_count: 178, subcategories: ["Li-Po", "Li-Ion", "NiMH", "Lead Acid"], sort_order: 7 },
    { name: "Tools & Equipment", slug: "tools", icon: "🛠️", product_count: 143, subcategories: ["Soldering", "Multimeters", "Hand Tools", "Power Supply"], sort_order: 8 },
  ];
  await supabase.from('categories').insert(categories);

  // Seed hero section
  await supabase.from('hero_sections').insert({
    title: "Build the Future with TechBharat",
    subtitle: "Explore Arduino, Raspberry Pi, Drone Parts, EV Kits, 3D Printing & more. Fast nationwide delivery with 24×7 support.",
    badge_text: "India's #1 Robotics & Electronics Store",
    cta_primary_text: "Shop Now",
    cta_secondary_text: "View Deals",
    is_active: true
  });

  // Seed promo banners
  await supabase.from('promo_banners').insert([
    { title: "Drone Starter Kits", subtitle: "Get up to 30% off on beginner-friendly drone kits. Build, fly, explore.", label: "Limited Offer", emoji: "🚁", cta_text: "Shop Drones", bg_type: "gradient-hero", is_active: true, sort_order: 1 },
    { title: "3D Printers & Filaments", subtitle: "Explore our curated collection of 3D printers starting at ₹14,999.", label: "New Arrival", emoji: "🖨️", cta_text: "Explore Now", bg_type: "secondary", is_active: true, sort_order: 2 },
  ]);

  // Seed site settings
  await supabase.from('site_settings').upsert([
    { key: 'store_name', value: { text: 'TechBharat' } },
    { key: 'free_shipping_threshold', value: { amount: 999 } },
    { key: 'support_phone', value: { text: '+91 12345 67890' } },
    { key: 'newsletter_title', value: { text: 'Stay in the Loop' } },
    { key: 'newsletter_subtitle', value: { text: 'Get exclusive deals, new product alerts, and maker tips delivered to your inbox.' } },
  ], { onConflict: 'key' });
}

// ============ PRODUCTS CRUD ============
app.get('/api/admin/products', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/products', async (req, res) => {
  const { featured, category, limit: lim } = req.query;
  let query = supabase.from('products').select('*');
  if (featured === 'true') query = query.eq('featured', true);
  if (category) query = query.eq('category', category);
  if (lim) query = query.limit(parseInt(lim));
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/products', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('products').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/products/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('products').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/products/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ CATEGORIES CRUD ============
app.get('/api/admin/categories', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/categories', async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/categories', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('categories').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/categories/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('categories').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/categories/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ HERO SECTIONS CRUD ============
app.get('/api/admin/hero-sections', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('hero_sections').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/hero-sections', async (req, res) => {
  const { data, error } = await supabase.from('hero_sections').select('*').eq('is_active', true).order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/admin/hero-sections', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('hero_sections').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/hero-sections/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('hero_sections').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/hero-sections/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('hero_sections').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ PROMO BANNERS CRUD ============
app.get('/api/admin/promo-banners', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('promo_banners').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/promo-banners', async (req, res) => {
  const { data, error } = await supabase.from('promo_banners').select('*').eq('is_active', true).order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/promo-banners', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('promo_banners').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/promo-banners/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('promo_banners').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/promo-banners/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('promo_banners').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ COUPONS CRUD ============
app.get('/api/admin/coupons', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/coupons', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('coupons').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/coupons/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('coupons').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/coupons/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('coupons').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Public coupon validation
app.post('/api/coupons/validate', async (req, res) => {
  const { code, orderAmount } = req.body;
  const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();

  if (error || !coupon) return res.status(404).json({ error: 'Invalid coupon code' });

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Coupon has expired' });
  }
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return res.status(400).json({ error: 'Coupon usage limit reached' });
  }
  if (orderAmount < coupon.min_order_amount) {
    return res.status(400).json({ error: `Minimum order amount is ₹${coupon.min_order_amount}` });
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (orderAmount * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
  } else {
    discount = coupon.discount_value;
  }

  res.json({ valid: true, discount, coupon: { code: coupon.code, description: coupon.description, discount_type: coupon.discount_type, discount_value: coupon.discount_value } });
});

// ============ USER AUTH (Supabase Auth) ============
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  // Use auth.signUp (works with anon key)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone: phone || '' },
    },
  });

  if (error) return res.status(400).json({ error: error.message });
  if (!data.user) return res.status(400).json({ error: 'Signup failed' });

  // Save to users table (visible in Supabase dashboard)
  await supabase.from('users').upsert({
    id: data.user.id,
    email: data.user.email,
    name,
    phone: phone || '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || name,
      phone: data.user.user_metadata?.phone || phone || '',
    },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: error.message });

  const userName = data.user.user_metadata?.name || email.split('@')[0];
  const userPhone = data.user.user_metadata?.phone || '';

  // Upsert to users table (keeps name visible in DB)
  await supabase.from('users').upsert({
    id: data.user.id,
    email: data.user.email,
    name: userName,
    phone: userPhone,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: userName,
      phone: userPhone,
    },
    session: { access_token: data.session.access_token },
  });
});

// ============ USER CART SYNC ============
app.get('/api/cart/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('user_carts')
    .select('items')
    .eq('user_id', req.params.userId)
    .single();

  if (error || !data) return res.json({ items: [] });
  res.json({ items: data.items || [] });
});

app.put('/api/cart/:userId', async (req, res) => {
  const { items } = req.body;
  const { error } = await supabase
    .from('user_carts')
    .upsert(
      { user_id: req.params.userId, items, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ SITE SETTINGS ============
app.get('/api/admin/settings', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings = {};
  data.forEach(s => { settings[s.key] = s.value; });
  res.json(settings);
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
  res.json({ success: true });
});

app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings = {};
  data.forEach(s => { settings[s.key] = s.value; });
  res.json(settings);
});

// ============ ORDERS ============
app.get('/api/admin/orders', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/admin/orders/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('orders').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ============ IMAGE UPLOAD ============
app.post('/api/admin/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage.from('images').upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });

    if (error) {
      // If storage bucket doesn't exist, return the base64 data URL
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      return res.json({ url: dataUrl, note: 'Stored as data URL - configure Supabase Storage for production' });
    }

    const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(filePath);
    res.json({ url: publicUrl.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD STATS ============
app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
  try {
    const [products, categories, orders, coupons] = await Promise.all([
      supabase.from('products').select('id, price, in_stock', { count: 'exact' }),
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, total, status', { count: 'exact' }),
      supabase.from('coupons').select('id, is_active', { count: 'exact' }),
    ]);

    const totalRevenue = (orders.data || []).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const pendingOrders = (orders.data || []).filter(o => o.status === 'pending').length;
    const outOfStock = (products.data || []).filter(p => !p.in_stock).length;

    res.json({
      totalProducts: products.count || 0,
      totalCategories: categories.count || 0,
      totalOrders: orders.count || 0,
      totalCoupons: coupons.count || 0,
      totalRevenue,
      pendingOrders,
      outOfStock,
      activeCoupons: (coupons.data || []).filter(c => c.is_active).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NAV LINKS CRUD ============
app.get('/api/admin/nav-links', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('nav_links').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/nav-links', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('nav_links').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/nav-links/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('nav_links').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/nav-links/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('nav_links').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ MEGA MENU CRUD ============
app.get('/api/admin/mega-menu', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('mega_menu').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/admin/mega-menu', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('mega_menu').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/mega-menu/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('mega_menu').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/mega-menu/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('mega_menu').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Public navigation data
app.get('/api/navigation', async (req, res) => {
  const [linksResult, menuResult] = await Promise.all([
    supabase.from('nav_links').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('mega_menu').select('*').eq('is_active', true).order('sort_order'),
  ]);
  res.json({
    navLinks: linksResult.data || [],
    megaMenu: menuResult.data || [],
  });
});

// ============ IMAGE UPLOAD ============
app.post('/api/admin/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      // Fallback: return base64 data URL if storage not configured
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      return res.json({ url: dataUrl });
    }

    const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
    res.json({ url: publicData.publicUrl });
  } catch (err) {
    // Fallback to base64
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      return res.json({ url: dataUrl });
    }
    res.status(500).json({ error: err.message });
  }
});

// ============ TESTIMONIALS CRUD ============
app.get('/api/admin/testimonials', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('testimonials').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/testimonials', async (req, res) => {
  const { data, error } = await supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/admin/testimonials', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('testimonials').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/testimonials/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('testimonials').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/testimonials/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('testimonials').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ FOOTER LINKS CRUD ============
app.get('/api/admin/footer-links', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('footer_links').select('*').order('section').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/footer-links', async (req, res) => {
  const { data, error } = await supabase.from('footer_links').select('*').eq('is_active', true).order('section').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/admin/footer-links', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('footer_links').insert(req.body).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/admin/footer-links/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('footer_links').update(req.body).eq('id', req.params.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/api/admin/footer-links/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('footer_links').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabase, timestamp: new Date().toISOString() });
});

// Global error handler — prevents unhandled errors from crashing the server
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for Vercel serverless
export default app;

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 TechBharat Admin Server running on http://localhost:${PORT}`);
    console.log(`📧 Admin Login: ${ADMIN_EMAIL}`);
    console.log(`🔑 Admin Password: ${ADMIN_PASSWORD}\n`);
  });
}

