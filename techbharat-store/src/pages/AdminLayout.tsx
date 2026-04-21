import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Package, Grid3X3, Image, Megaphone,
  Ticket, ShoppingBag, Settings, LogOut, Menu, X, ChevronRight, Navigation2,
  MessageSquareQuote, Link2
} from "lucide-react";
import adminApi from "@/lib/adminApi";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Categories", icon: Grid3X3, path: "/admin/categories" },
  { label: "Navigation", icon: Navigation2, path: "/admin/navigation" },
  { label: "Hero Sections", icon: Image, path: "/admin/hero" },
  { label: "Promo Banners", icon: Megaphone, path: "/admin/promos" },
  { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
  { label: "Testimonials", icon: MessageSquareQuote, path: "/admin/testimonials" },
  { label: "Footer", icon: Link2, path: "/admin/footer" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!adminApi.getToken()) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    adminApi.clearToken();
    navigate("/admin");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[hsl(220,20%,7%)] flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-[hsl(220,20%,9%)] border-r border-white/[0.06] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">T</span>
              </div>
              <span className="font-heading font-bold text-white text-sm">
                Tech<span className="text-primary">Bharat</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/80 transition-all"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(234,88,12,0.15)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-[hsl(220,20%,9%)] border-r border-white/[0.06] flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-sm">T</span>
                </div>
                <span className="font-heading font-bold text-white text-sm">
                  Tech<span className="text-primary">Bharat</span>
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Top bar */}
        <header className="h-16 bg-[hsl(220,20%,9%)]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.05] text-white/40"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-heading font-semibold text-white text-lg">
              {sidebarItems.find((i) => isActive(i.path))?.label || "Admin Panel"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-xs text-white/30 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-primary/20"
            >
              View Store →
            </a>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
