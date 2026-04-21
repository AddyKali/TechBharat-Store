import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Copy, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface Coupon {
  id: string; code: string; description: string; discount_type: string;
  discount_value: number; min_order_amount: number; max_discount_amount: number | null;
  usage_limit: number | null; used_count: number; is_active: boolean;
  starts_at: string; expires_at: string | null;
}

const empty: Partial<Coupon> = {
  code: "", description: "", discount_type: "percentage", discount_value: 10,
  min_order_amount: 0, max_discount_amount: null, usage_limit: null,
  used_count: 0, is_active: true, starts_at: new Date().toISOString(), expires_at: null,
};

const AdminCoupons = () => {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Partial<Coupon>>(empty);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setItems(await adminApi.getCoupons()); } catch {} finally { setLoading(false); }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "TB";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setEdit(p => ({ ...p, code }));
  };

  const openNew = () => { setEdit(empty); setEditMode(false); generateCode(); setShowModal(true); };
  const openEdit = (i: Coupon) => { setEdit(i); setEditMode(true); setShowModal(true); };

  const save = async () => {
    if (!edit.code || !edit.discount_value) { toast({ title: "Code & discount required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...edit, code: edit.code!.toUpperCase() };
      if (editMode && edit.id) { const { id, created_at, ...r } = payload as any; await adminApi.updateCoupon(id, r); }
      else await adminApi.createCoupon(payload);
      toast({ title: editMode ? "Coupon Updated" : "Coupon Created" });
      setShowModal(false); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try { await adminApi.deleteCoupon(id); load(); } catch {}
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: code });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-heading font-bold text-xl text-white">Coupons & Discounts</h1><p className="text-white/30 text-xs">Create and manage discount coupons</p></div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm"><Plus className="w-4 h-4" /> Create Coupon</Button>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.06]">
              {["Code","Type","Discount","Min Order","Max Discount","Usage","Status","Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-white/20 hover:text-white/60"><Copy className="w-3 h-3" /></button>
                    </div>
                    {c.description && <p className="text-white/20 text-xs mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-white/50 text-sm capitalize">{c.discount_type}</td>
                  <td className="px-5 py-3 text-white font-semibold text-sm">{c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td className="px-5 py-3 text-white/40 text-sm">₹{c.min_order_amount}</td>
                  <td className="px-5 py-3 text-white/40 text-sm">{c.max_discount_amount ? `₹${c.max_discount_amount}` : "—"}</td>
                  <td className="px-5 py-3 text-white/40 text-sm">{c.used_count}/{c.usage_limit || "∞"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-white/20 text-sm">No coupons yet. Create your first coupon!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit" : "Create"} Coupon</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Coupon Code</label>
              <div className="flex gap-2">
                <input value={edit.code || ""} onChange={e => setEdit(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <Button onClick={generateCode} variant="outline" size="sm" className="rounded-xl text-white/50 border-white/[0.08]">Generate</Button>
              </div></div>
              <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Description</label>
              <input value={edit.description || ""} onChange={e => setEdit(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Discount Type</label>
                <select value={edit.discount_type || "percentage"} onChange={e => setEdit(p => ({ ...p, discount_type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none">
                  <option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option>
                </select></div>
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Discount Value</label>
                <input type="number" value={edit.discount_value || ""} onChange={e => setEdit(p => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Min Order (₹)</label>
                <input type="number" value={edit.min_order_amount || ""} onChange={e => setEdit(p => ({ ...p, min_order_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Max Discount (₹)</label>
                <input type="number" value={edit.max_discount_amount || ""} onChange={e => setEdit(p => ({ ...p, max_discount_amount: parseFloat(e.target.value) || null }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Usage Limit</label>
                <input type="number" value={edit.usage_limit || ""} onChange={e => setEdit(p => ({ ...p, usage_limit: parseInt(e.target.value) || null }))} placeholder="Unlimited"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Expires At</label>
                <input type="datetime-local" value={edit.expires_at ? new Date(edit.expires_at).toISOString().slice(0, 16) : ""} onChange={e => setEdit(p => ({ ...p, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={edit.is_active ?? true} onChange={e => setEdit(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-white/60 text-sm">Active</span></label>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-white/40">Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}{editMode ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
