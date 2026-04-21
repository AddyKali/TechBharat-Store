import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface Testimonial {
  id: string;
  name: string;
  avatar_url: string;
  rating: number;
  review: string;
  time_ago: string;
  is_active: boolean;
  sort_order: number;
}

const empty: Partial<Testimonial> = {
  name: "", avatar_url: "", rating: 5, review: "", time_ago: "a month ago",
  is_active: true, sort_order: 0,
};

const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Testimonial>>(empty);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setItems(await adminApi.getTestimonials()); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditItem(empty); setEditMode(false); setShowModal(true); };
  const openEdit = (item: Testimonial) => { setEditItem(item); setEditMode(true); setShowModal(true); };

  const handleSave = async () => {
    if (!editItem.name || !editItem.review) { toast({ title: "Name and review required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editMode && editItem.id) {
        const { id, created_at, ...rest } = editItem as any;
        await adminApi.updateTestimonial(id, rest);
      } else {
        await adminApi.createTestimonial(editItem);
      }
      toast({ title: editMode ? "Updated" : "Created" });
      setShowModal(false); loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try { await adminApi.deleteTestimonial(id); toast({ title: "Deleted" }); loadData(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-white">Testimonials</h1>
          <p className="text-white/30 text-xs mt-0.5">Manage customer reviews displayed on homepage</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Review
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${item.is_active ? "border-primary/20" : "border-white/[0.06] opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-heading font-bold text-white">{item.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/20">{item.time_ago}</span>
                </div>
                <p className="text-white/40 text-sm line-clamp-2">{item.review}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center text-white/20 text-sm">No testimonials yet.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit Review" : "Add Review"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Name *</label>
                <input value={editItem.name || ""} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Avatar URL</label>
                <input value={editItem.avatar_url || ""} onChange={e => setEditItem(p => ({ ...p, avatar_url: e.target.value }))}
                  placeholder="Optional image URL"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Review *</label>
                <textarea rows={3} value={editItem.review || ""} onChange={e => setEditItem(p => ({ ...p, review: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Rating</label>
                  <select value={editItem.rating ?? 5} onChange={e => setEditItem(p => ({ ...p, rating: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Time Ago</label>
                  <input value={editItem.time_ago || ""} onChange={e => setEditItem(p => ({ ...p, time_ago: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Order</label>
                  <input type="number" value={editItem.sort_order ?? 0} onChange={e => setEditItem(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editItem.is_active ?? true} onChange={e => setEditItem(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.08] text-primary focus:ring-primary" />
                <span className="text-white/60 text-sm">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-white/40 hover:text-white">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
