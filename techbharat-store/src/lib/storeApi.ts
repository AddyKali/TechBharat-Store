import { featuredProducts as mockProducts, categories as mockCategories } from "@/data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "";

// No-cache fetch helper — always gets fresh data
async function freshFetch(url: string) {
  return fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
}

// Fetch products from API with fallback to mock data
export async function fetchProducts(options?: { featured?: boolean; category?: string; limit?: number }) {
  try {
    const params = new URLSearchParams();
    if (options?.featured) params.set("featured", "true");
    if (options?.category) params.set("category", options.category);
    if (options?.limit) params.set("limit", String(options.limit));

    const res = await freshFetch(`${API_URL}/api/products?${params}`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    if (data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        image: p.image || "",
        category: p.category || "",
        rating: Number(p.rating) || 0,
        reviews: Number(p.reviews) || 0,
        badge: p.badge || undefined,
        inStock: p.in_stock !== false,
      }));
    }
    throw new Error("Empty");
  } catch {
    return mockProducts;
  }
}

// Fetch categories from API with fallback
export async function fetchCategories() {
  try {
    const res = await freshFetch(`${API_URL}/api/categories`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    if (data && data.length > 0) {
      return data.map((c: any) => ({
        id: c.slug || c.id,
        name: c.name,
        icon: c.icon || "📦",
        productCount: Number(c.product_count) || 0,
        subcategories: c.subcategories || [],
      }));
    }
    throw new Error("Empty");
  } catch {
    return mockCategories;
  }
}

// Fetch all active hero slides for carousel
export async function fetchHeroSlides() {
  try {
    const res = await freshFetch(`${API_URL}/api/hero-sections`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    return [];
  } catch {
    return [];
  }
}

// Compat alias
export const fetchHeroSection = async () => {
  const slides = await fetchHeroSlides();
  return slides[0] || null;
}

// Fetch active promo banners
export async function fetchPromoBanners() {
  try {
    const res = await freshFetch(`${API_URL}/api/promo-banners`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (data && data.length > 0) return data;
    return null;
  } catch {
    return null;
  }
}

// Fetch site settings
export async function fetchSettings() {
  try {
    const res = await freshFetch(`${API_URL}/api/settings`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return {};
  }
}

// Validate a coupon code
export async function validateCoupon(code: string, orderAmount: number) {
  const res = await fetch(`${API_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, orderAmount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid coupon");
  return data;
}

// Fetch navigation (nav links + mega menu)
export async function fetchNavigation() {
  try {
    const res = await freshFetch(`${API_URL}/api/navigation`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return {
      navLinks: [
        { label: "New Arrivals", href: "/products?tag=new" },
        { label: "Bestsellers", href: "/products?tag=bestseller" },
        { label: "Deals", href: "/products?tag=deal" },
        { label: "DIY Kits", href: "/products?category=DIY+Kits" },
        { label: "EV Parts", href: "/products?category=EV+Components" },
        { label: "3D Printing", href: "/products?category=3D+Printing" },
      ],
      megaMenu: [],
    };
  }
}

// Fetch testimonials
export async function fetchTestimonials() {
  try {
    const res = await freshFetch(`${API_URL}/api/testimonials`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return [];
  }
}

// Fetch footer links
export async function fetchFooterLinks() {
  try {
    const res = await freshFetch(`${API_URL}/api/footer-links`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return [];
  }
}

