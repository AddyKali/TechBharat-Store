const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AdminAPI {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  getToken() {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (this.token) {
      headers['x-admin-token'] = this.token;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/admin';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  // Dashboard
  async getDashboard() {
    return this.request('/api/admin/dashboard');
  }

  // Init DB
  async initDB() {
    return this.request('/api/admin/init-db', { method: 'POST' });
  }

  // Products
  async getProducts() {
    return this.request('/api/admin/products');
  }
  async createProduct(product: any) {
    return this.request('/api/admin/products', { method: 'POST', body: JSON.stringify(product) });
  }
  async updateProduct(id: string, product: any) {
    return this.request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
  }
  async deleteProduct(id: string) {
    return this.request(`/api/admin/products/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request('/api/admin/categories');
  }
  async createCategory(category: any) {
    return this.request('/api/admin/categories', { method: 'POST', body: JSON.stringify(category) });
  }
  async updateCategory(id: string, category: any) {
    return this.request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) });
  }
  async deleteCategory(id: string) {
    return this.request(`/api/admin/categories/${id}`, { method: 'DELETE' });
  }

  // Hero Sections
  async getHeroSections() {
    return this.request('/api/admin/hero-sections');
  }
  async createHeroSection(hero: any) {
    return this.request('/api/admin/hero-sections', { method: 'POST', body: JSON.stringify(hero) });
  }
  async updateHeroSection(id: string, hero: any) {
    return this.request(`/api/admin/hero-sections/${id}`, { method: 'PUT', body: JSON.stringify(hero) });
  }
  async deleteHeroSection(id: string) {
    return this.request(`/api/admin/hero-sections/${id}`, { method: 'DELETE' });
  }

  // Promo Banners
  async getPromoBanners() {
    return this.request('/api/admin/promo-banners');
  }
  async createPromoBanner(banner: any) {
    return this.request('/api/admin/promo-banners', { method: 'POST', body: JSON.stringify(banner) });
  }
  async updatePromoBanner(id: string, banner: any) {
    return this.request(`/api/admin/promo-banners/${id}`, { method: 'PUT', body: JSON.stringify(banner) });
  }
  async deletePromoBanner(id: string) {
    return this.request(`/api/admin/promo-banners/${id}`, { method: 'DELETE' });
  }

  // Coupons
  async getCoupons() {
    return this.request('/api/admin/coupons');
  }
  async createCoupon(coupon: any) {
    return this.request('/api/admin/coupons', { method: 'POST', body: JSON.stringify(coupon) });
  }
  async updateCoupon(id: string, coupon: any) {
    return this.request(`/api/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(coupon) });
  }
  async deleteCoupon(id: string) {
    return this.request(`/api/admin/coupons/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders() {
    return this.request('/api/admin/orders');
  }
  async updateOrder(id: string, order: any) {
    return this.request(`/api/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(order) });
  }

  // Settings
  async getSettings() {
    return this.request('/api/admin/settings');
  }
  async updateSettings(settings: any) {
    return this.request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
  }

  // Nav Links
  async getNavLinks() {
    return this.request('/api/admin/nav-links');
  }
  async createNavLink(link: any) {
    return this.request('/api/admin/nav-links', { method: 'POST', body: JSON.stringify(link) });
  }
  async updateNavLink(id: string, link: any) {
    return this.request(`/api/admin/nav-links/${id}`, { method: 'PUT', body: JSON.stringify(link) });
  }
  async deleteNavLink(id: string) {
    return this.request(`/api/admin/nav-links/${id}`, { method: 'DELETE' });
  }

  // Mega Menu
  async getMegaMenu() {
    return this.request('/api/admin/mega-menu');
  }
  async createMegaMenu(menu: any) {
    return this.request('/api/admin/mega-menu', { method: 'POST', body: JSON.stringify(menu) });
  }
  async updateMegaMenu(id: string, menu: any) {
    return this.request(`/api/admin/mega-menu/${id}`, { method: 'PUT', body: JSON.stringify(menu) });
  }
  async deleteMegaMenu(id: string) {
    return this.request(`/api/admin/mega-menu/${id}`, { method: 'DELETE' });
  }

  // Testimonials
  async getTestimonials() {
    return this.request('/api/admin/testimonials');
  }
  async createTestimonial(t: any) {
    return this.request('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(t) });
  }
  async updateTestimonial(id: string, t: any) {
    return this.request(`/api/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(t) });
  }
  async deleteTestimonial(id: string) {
    return this.request(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
  }

  // Footer Links
  async getFooterLinks() {
    return this.request('/api/admin/footer-links');
  }
  async createFooterLink(link: any) {
    return this.request('/api/admin/footer-links', { method: 'POST', body: JSON.stringify(link) });
  }
  async updateFooterLink(id: string, link: any) {
    return this.request(`/api/admin/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(link) });
  }
  async deleteFooterLink(id: string) {
    return this.request(`/api/admin/footer-links/${id}`, { method: 'DELETE' });
  }

  // Upload
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { 'x-admin-token': this.token || '' },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  }
}

export const adminApi = new AdminAPI();
export default adminApi;

