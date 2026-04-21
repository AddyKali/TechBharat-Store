import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface PromoBanner {
  id: string; title: string; subtitle: string; label: string; emoji: string;
  cta_text: string; cta_link: string; bg_type: string; is_active: boolean; sort_order: number;
}

const empty: Partial<PromoBanner> = {
  title: "", subtitle: "", label: "", emoji: "", cta_text: "Shop Now",
  cta_link: "#", bg_type: "gradient-hero", is_active: true, sort_order: 0,
};

const AdminPromos = () => {
  const [items, setItems] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Partial<PromoBanner>>(empty);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setItems(await adminApi.getPromoBanners()); } catch {} finally { setLoading(false); }
  };

  const openNew = () => { setEdit(empty); setEditMode(false); setShowModal(true); };
  const openEdit = (i: PromoBanner) => { setEdit(i); setEditMode(true); setShowModal(true); };

  const save = async () => {
    if (!edit.title) return;
    setSaving(true);
    try {
      if (editMode && edit.id) { const { id, created_at, ...r } = edit as any; await adminApi.updatePromoBanner(id, r); }
      else await adminApi.createPromoBanner(edit);
      setShowModal(false); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    try { await adminApi.deletePromoBanner(id); load(); } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-heading font-bold text-xl text-white">Promo Banners</h1><p className="text-white/30 text-xs">Manage promotional banners</p></div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm"><Plus className="w-4 h-4" /> Add Banner</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(i => (
          <div key={i.id} className={`relative rounded-2xl p-6 min-h-[180px] flex flex-col justify-center border ${i.bg_type === "gradient-hero" ? "bg-gradient-hero border-white/[0.06]" : "bg-white/[0.03] border-white/[0.06]"} ${!i.is_active ? "opacity-50" : ""}`}>
            <div className="absolute top-3 right-3 flex gap-1 z-10">
              <button onClick={() => openEdit(i)} className="p-1.5 rounded-lg bg-black/30 text-white/50 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => del(i.id)} className="p-1.5 rounded-lg bg-black/30 text-white/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            {i.label && <p className="text-primary font-heading font-bold text-xs uppercase mb-2">{i.label}</p>}
            <h3 className="font-heading font-bold text-lg text-white mb-1">{i.title}</h3>
            <p className="text-white/40 text-sm max-w-xs">{i.subtitle}</p>
            <span className="mt-3 text-xs px-3 py-1 rounded-lg bg-primary/20 text-primary font-medium w-fit">{i.cta_text}</span>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit" : "Add"} Banner</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[{ l: "Title", k: "title" }, { l: "Subtitle", k: "subtitle" }, { l: "Label", k: "label" }].map(f => (
                <div key={f.k}><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">{f.l}</label>
                <input value={(edit as any)[f.k] || ""} onChange={e => setEdit(p => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" /></div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Emoji</label>
                <input value={edit.emoji || ""} onChange={e => setEdit(p => ({ ...p, emoji: e.target.value }))} placeholder="🚁"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
                <div><label className="block text-white/40 text-xs mb-1.5 uppercase">CTA Text</label>
                <input value={edit.cta_text || ""} onChange={e => setEdit(p => ({ ...p, cta_text: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none" /></div>
              </div>
              <div><label className="block text-white/40 text-xs mb-1.5 uppercase">Background</label>
              <select value={edit.bg_type || ""} onChange={e => setEdit(p => ({ ...p, bg_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none">
                <option value="gradient-hero">Dark Gradient</option><option value="secondary">Light</option>
              </select></div>
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

export default AdminPromos;
