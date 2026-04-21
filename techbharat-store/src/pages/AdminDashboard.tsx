import { useState, useEffect } from "react";
import { Package, Grid3X3, ShoppingBag, Ticket, TrendingUp, AlertCircle, DollarSign, BarChart3, Loader2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCoupons: number;
  totalRevenue: number;
  pendingOrders: number;
  outOfStock: number;
  activeCoupons: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err: any) {
      // If tables don't exist yet, show init button
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitDB = async () => {
    setInitLoading(true);
    try {
      await adminApi.initDB();
      toast({ title: "Database Initialized", description: "All tables and seed data created successfully!" });
      loadStats();
    } catch (err: any) {
      toast({ title: "Init Error", description: err.message, variant: "destructive" });
    } finally {
      setInitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Products", value: stats.totalProducts, icon: Package, color: "from-blue-500 to-blue-600", change: `${stats.outOfStock} out of stock` },
        { label: "Categories", value: stats.totalCategories, icon: Grid3X3, color: "from-purple-500 to-purple-600", change: "Active categories" },
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "from-emerald-500 to-emerald-600", change: `${stats.pendingOrders} pending` },
        { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "from-primary to-orange-600", change: "All time" },
        { label: "Active Coupons", value: stats.activeCoupons, icon: Ticket, color: "from-pink-500 to-pink-600", change: `${stats.totalCoupons} total` },
        { label: "Pending Orders", value: stats.pendingOrders, icon: AlertCircle, color: "from-amber-500 to-amber-600", change: "Needs attention" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Dashboard Overview</h1>
          <p className="text-white/40 text-sm mt-1">Monitor your store's performance and manage content</p>
        </div>
        <button
          onClick={handleInitDB}
          disabled={initLoading}
          className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-2"
        >
          {initLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />}
          Initialize / Seed DB
        </button>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400/40 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="font-heading font-bold text-2xl text-white">{card.value}</p>
              <p className="text-white/30 text-xs mt-1">{card.label}</p>
              <p className="text-white/20 text-[10px] mt-2 uppercase tracking-wider">{card.change}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm mb-4">No data yet. Initialize the database to get started.</p>
          <button
            onClick={handleInitDB}
            disabled={initLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white text-sm font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            {initLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Initialize Database & Seed Data
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-white text-sm mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Product", path: "/admin/products", icon: Package },
            { label: "Create Coupon", path: "/admin/coupons", icon: Ticket },
            { label: "Edit Hero", path: "/admin/hero", icon: TrendingUp },
            { label: "View Orders", path: "/admin/orders", icon: ShoppingBag },
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 hover:bg-primary/[0.03] text-white/50 hover:text-primary text-sm font-medium transition-all"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
