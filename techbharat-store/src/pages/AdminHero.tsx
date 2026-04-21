import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  background_image: string;
  is_active: boolean;
  sort_order: number;
}

const emptyHero: Partial<HeroSection> = {
  title: "", subtitle: "", badge_text: "", cta_primary_text: "Shop Now",
  cta_primary_link: "#", cta_secondary_text: "View Deals", cta_secondary_link: "#",
  background_image: "", is_active: true, sort_order: 0,
};

const AdminHero = () => {
  const [items, setItems] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<HeroSection>>(emptyHero);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setItems(await adminApi.getHeroSections()); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditItem(emptyHero); setEditMode(false); setShowModal(true); };
  const openEdit = (item: HeroSection) => { setEditItem(item); setEditMode(true); setShowModal(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(file);
      setEditItem(p => ({ ...p, background_image: url }));
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editItem.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editMode && editItem.id) {
        const { id, created_at, ...rest } = editItem as any;
        await adminApi.updateHeroSection(id, rest);
      } else {
        await adminApi.createHeroSection(editItem);
      }
      toast({ title: editMode ? "Hero Updated" : "Hero Created" });
      setShowModal(false); loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero section?")) return;
    try { await adminApi.deleteHeroSection(id); toast({ title: "Deleted" }); loadData(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const toggleActive = async (item: HeroSection) => {
    try {
      await adminApi.updateHeroSection(item.id, { is_active: !item.is_active });
      loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-white">Hero Slides</h1>
          <p className="text-white/30 text-xs mt-0.5">Manage the auto-sliding banner carousel on your homepage</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Slide
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${item.is_active ? "border-primary/20" : "border-white/[0.06] opacity-60"}`}>
            {/* Image preview */}
            {item.background_image && (
              <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${item.background_image})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/40 text-white/70 backdrop-blur-sm">
                  Slide {idx + 1}
                </span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {item.is_active && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Active</span>}
                    {item.badge_text && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.badge_text}</span>}
                    {!item.background_image && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">No Image</span>}
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg">{item.title}</h3>
                  <p className="text-white/40 text-sm mt-1 line-clamp-2">{item.subtitle}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-white/20">CTA: {item.cta_primary_text}</span>
                    <span className="text-xs text-white/20">|</span>
                    <span className="text-xs text-white/20">{item.cta_secondary_text}</span>
                    <span className="text-xs text-white/20">|</span>
                    <span className="text-xs text-white/20">Order: {item.sort_order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => toggleActive(item)} className={`p-2 rounded-lg transition-all ${item.is_active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/20 hover:bg-white/[0.05]"}`}>
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center text-white/20 text-sm">No hero slides yet. Add your first slide above.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit Slide" : "Add Slide"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Banner Image</label>
                {editItem.background_image ? (
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <img src={editItem.background_image} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setEditItem(p => ({ ...p, background_image: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-white/[0.02] transition-all mb-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-white/15" />
                        <span className="text-white/30 text-xs">Click to upload image</span>
                      </>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex items-center gap-2">
                  <input
                    value={editItem.background_image || ""}
                    onChange={e => setEditItem(p => ({ ...p, background_image: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="flex-1 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                    className="bg-white/[0.06] text-white/60 hover:text-white border border-white/[0.08] gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Title *</label>
                <input value={editItem.title || ""} onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Subtitle</label>
                <textarea rows={2} value={editItem.subtitle || ""} onChange={e => setEditItem(p => ({ ...p, subtitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Badge Text</label>
                <input value={editItem.badge_text || ""} onChange={e => setEditItem(p => ({ ...p, badge_text: e.target.value }))}
                  placeholder="e.g. India's #1 Robotics Store"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">CTA Primary Text</label>
                  <input value={editItem.cta_primary_text || ""} onChange={e => setEditItem(p => ({ ...p, cta_primary_text: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">CTA Secondary Text</label>
                  <input value={editItem.cta_secondary_text || ""} onChange={e => setEditItem(p => ({ ...p, cta_secondary_text: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Sort Order</label>
                  <input type="number" value={editItem.sort_order ?? 0} onChange={e => setEditItem(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editItem.is_active ?? true} onChange={e => setEditItem(p => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.08] text-primary focus:ring-primary" />
                    <span className="text-white/60 text-sm">Active</span>
                  </label>
                </div>
              </div>
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

export default AdminHero;
