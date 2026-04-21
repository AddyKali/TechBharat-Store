import { useState, useEffect } from "react";
import { Loader2, Package, ChevronDown } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string; user_email: string; user_name: string; items: any[];
  subtotal: number; discount: number; coupon_code: string; total: number;
  status: string; shipping_address: any; created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  processing: "bg-blue-500/10 text-blue-400",
  shipped: "bg-purple-500/10 text-purple-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setOrders(await adminApi.getOrders()); } catch {} finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await adminApi.updateOrder(id, { status }); toast({ title: `Order ${status}` }); load(); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div><h1 className="font-heading font-bold text-xl text-white">Orders</h1><p className="text-white/30 text-xs">{orders.length} orders total</p></div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.06]">
              {["Order ID","Customer","Items","Total","Coupon","Status","Date",""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white/60 text-xs font-mono">{o.id.slice(0, 8)}...</td>
                  <td className="px-5 py-3"><p className="text-white text-sm">{o.user_name || "Guest"}</p><p className="text-white/30 text-xs">{o.user_email}</p></td>
                  <td className="px-5 py-3 text-white/50 text-sm">{o.items?.length || 0} items</td>
                  <td className="px-5 py-3 text-white font-semibold text-sm">₹{o.total?.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-primary text-xs font-mono">{o.coupon_code || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[o.status] || statusColors.pending}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-white/30 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none">
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-white/20 text-sm">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
