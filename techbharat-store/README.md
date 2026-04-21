# 🛒 TechBharat Store

**India's #1 Robotics & Electronics E-Commerce Store**

A full-stack e-commerce platform built for makers, hobbyists, and professionals — featuring Arduino, Raspberry Pi, Drone Parts, 3D Printing, EV Components, and 500+ electronic products with a sleek dark-themed glassmorphism UI.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS 3 + shadcn/ui components |
| **State** | React Context (Auth & Cart) + TanStack React Query |
| **Routing** | React Router DOM v6 |
| **Backend** | Node.js + Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (user accounts) + Custom token auth (admin panel) |
| **File Upload** | Multer → Supabase Storage |
| **Charts** | Recharts |

---

## 📁 Project Structure

```
techbharat-store/
├── .env                         # Environment variables (Supabase keys, admin creds)
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS theme & custom design tokens
├── tsconfig.json                # TypeScript config
│
├── server/                      # Backend (Express.js API)
│   ├── package.json             # Server dependencies
│   ├── server.js                # Main server — all API routes
│   └── supabase-migration.sql   # SQL schema for Supabase tables
│
├── src/
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Router & provider setup
│   ├── index.css                # Global CSS + design system tokens
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Header.tsx           # Main store header with navigation
│   │   ├── HeroSection.tsx      # Dynamic hero banner (API-driven)
│   │   ├── CategoryGrid.tsx     # Category browsing grid
│   │   ├── FeaturedProducts.tsx  # Trending products carousel
│   │   ├── ProductCard.tsx      # Individual product card
│   │   ├── PromoBar.tsx         # Promotional banners
│   │   ├── Newsletter.tsx       # Email subscription section
│   │   ├── Footer.tsx           # Site footer
│   │   ├── NavLink.tsx          # Navigation link component
│   │   └── ui/                  # shadcn/ui primitives (button, dialog, toast, etc.)
│   │
│   ├── pages/                   # Route pages
│   │   ├── Index.tsx            # Homepage
│   │   ├── Products.tsx         # Product listing with filters
│   │   ├── Auth.tsx             # Login / Signup page
│   │   ├── Cart.tsx             # Shopping cart
│   │   ├── Checkout.tsx         # Checkout flow
│   │   ├── NotFound.tsx         # 404 page
│   │   ├── AdminLogin.tsx       # Admin login
│   │   ├── AdminLayout.tsx      # Admin sidebar layout
│   │   ├── AdminDashboard.tsx   # Admin dashboard with stats
│   │   ├── AdminProducts.tsx    # CRUD for products
│   │   ├── AdminCategories.tsx  # CRUD for categories
│   │   ├── AdminHero.tsx        # Manage hero banners
│   │   ├── AdminPromos.tsx      # Manage promo banners
│   │   ├── AdminCoupons.tsx     # Manage coupon codes
│   │   ├── AdminOrders.tsx      # Order management
│   │   ├── AdminSettings.tsx    # Site settings
│   │   └── AdminNavigation.tsx  # Manage navigation links & mega menu
│   │
│   ├── contexts/                # React context providers
│   │   ├── AuthContext.tsx      # User authentication state
│   │   └── CartContext.tsx      # Shopping cart state
│   │
│   ├── lib/                     # Utility & API libraries
│   │   ├── adminApi.ts          # Admin panel API client (token-based auth)
│   │   ├── storeApi.ts          # Storefront API client (public endpoints)
│   │   └── utils.ts             # Misc utility functions (cn)
│   │
│   ├── data/
│   │   └── mockData.ts          # Fallback mock data when API is unavailable
│   │
│   └── hooks/                   # Custom React hooks
│       ├── use-mobile.tsx       # Mobile breakpoint detection
│       ├── use-toast.ts         # Toast notification hook
│       └── useScrollReveal.ts   # Intersection observer for scroll animations
│
└── public/                      # Static assets
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have:

- **Node.js** ≥ 18.x — [Download here](https://nodejs.org/)
- **npm** ≥ 9.x (comes with Node.js)
- **A Supabase account** — [Sign up free](https://supabase.com/) (for database & auth)

---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/techbharat-store.git
cd techbharat-store
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Server Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

Create/edit the `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# (Optional) Supabase Service Role Key — for admin server operations
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Panel Credentials
ADMIN_EMAIL=admin@techbharat.com
ADMIN_PASSWORD=TechBharat@2026

# Backend Server
VITE_API_URL=http://localhost:3001
PORT=3001
```

> **Where to find your Supabase keys:**
> 1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Open your project → **Settings** → **API**
> 3. Copy the **Project URL** → `VITE_SUPABASE_URL`
> 4. Copy the **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 5. Set Up the Database (Supabase)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy the entire contents of `server/supabase-migration.sql`
4. Paste and click **Run** ✅
5. This creates all required tables: `products`, `categories`, `hero_sections`, `promo_banners`, `coupons`, `site_settings`, `orders`, `nav_links`, `mega_menu`

---

## 🚀 Running the Application

### Option A: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This starts:
- **Backend API** → `http://localhost:3001`
- **Frontend Dev Server** → `http://localhost:8080`

### Option B: Run Separately (Two Terminals)

**Terminal 1 — Backend Server:**
```bash
npm run server
```

**Terminal 2 — Frontend Dev Server:**
```bash
npm run dev
```

### 6. Seed the Database

1. Open the store: `http://localhost:8080`
2. Navigate to the admin panel: `http://localhost:8080/admin`
3. Login with:
   - **Email:** `admin@techbharat.com`
   - **Password:** `TechBharat@2026`
4. Click **"Initialize / Seed DB"** on the dashboard
5. The database will populate with sample products, categories, hero banners, and promo data

---

## 🌐 Available Routes

### Storefront (Public)

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero banner, categories, featured products, promos |
| `/products` | Product listing with category filters & search |
| `/auth` | User login & registration |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with coupon support |

### Admin Panel (Protected)

| Route | Description |
|-------|-------------|
| `/admin` | Admin login page |
| `/admin/dashboard` | Dashboard with revenue, orders, and stock stats |
| `/admin/products` | Add, edit, delete products |
| `/admin/categories` | Manage product categories |
| `/admin/hero` | Edit hero banner content |
| `/admin/promos` | Manage promotional banners |
| `/admin/coupons` | Create & manage coupon codes |
| `/admin/orders` | View & update order statuses |
| `/admin/settings` | Store-wide settings (name, shipping threshold, etc.) |
| `/admin/navigation` | Configure navigation links & mega menu |

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `?featured=true`, `?category=`, `?limit=`) |
| GET | `/api/categories` | List all categories |
| GET | `/api/hero-sections` | Get active hero banner |
| GET | `/api/promo-banners` | Get active promo banners |
| GET | `/api/settings` | Get site settings |
| GET | `/api/navigation` | Get nav links & mega menu |
| POST | `/api/coupons/validate` | Validate a coupon code |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/cart/:userId` | Get user's cart |
| PUT | `/api/cart/:userId` | Sync user's cart |
| GET | `/api/health` | Health check |

### Admin Endpoints (Require `x-admin-token` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin authentication |
| POST | `/api/admin/init-db` | Seed database with sample data |
| GET | `/api/admin/dashboard` | Dashboard statistics |
| CRUD | `/api/admin/products` | Products management |
| CRUD | `/api/admin/categories` | Categories management |
| CRUD | `/api/admin/hero-sections` | Hero sections management |
| CRUD | `/api/admin/promo-banners` | Promo banners management |
| CRUD | `/api/admin/coupons` | Coupons management |
| GET/PUT | `/api/admin/orders` | Orders management |
| GET/PUT | `/api/admin/settings` | Site settings |
| CRUD | `/api/admin/nav-links` | Navigation links |
| CRUD | `/api/admin/mega-menu` | Mega menu items |
| POST | `/api/admin/upload` | Image upload |

---

## 🎨 Design System

The app uses a custom dark-themed glassmorphism design system built on Tailwind CSS:

- **Colors:** Warm saffron-orange primary (`hsl(28, 95%, 49%)`), dark surfaces
- **Typography:** System fonts via Tailwind + custom heading weights
- **Effects:** Glassmorphism (backdrop-blur), gradient backgrounds, hover animations
- **Animations:** Scroll-reveal, floating particles, shimmer effects, pulse-glow CTAs
- **Components:** shadcn/ui base components with custom theming

---

## 🧪 Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

---

## 📦 Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder. Serve it with any static file server.

```bash
npm run preview   # Preview production build locally
```

---

## 🐛 Troubleshooting

### "Init Error — Failed to fetch"

This means the **backend server is not running**. The frontend tries to connect to `http://localhost:3001` but gets no response.

**Fix:** Start the backend server first:
```bash
# In a separate terminal
npm run server
```
Then retry the "Initialize / Seed DB" button.

### "Tables not found" Error

The Supabase database tables haven't been created yet.

**Fix:** Run the SQL migration in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Paste `server/supabase-migration.sql` → Run

### Frontend shows empty data / mock data

The storefront gracefully falls back to mock data when the API is unreachable. Ensure:
1. Backend server is running on port 3001
2. Database tables are created and seeded
3. `.env` has correct Supabase URL and keys

### Port conflicts

- Frontend default: `8080` (configured in `vite.config.ts`)
- Backend default: `3001` (configured in `.env`)

Change these in the respective config files if ports are occupied.

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ by TechBharat Team
</p>
