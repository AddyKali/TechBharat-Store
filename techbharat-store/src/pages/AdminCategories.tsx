import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
  subcategories: string[];
  sort_order: number;
}

const emptyCategory: Partial<Category> = {
  name: "", slug: "", icon: "", product_count: 0, subcategories: [], sort_order: 0,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Partial<Category>>(emptyCategory);
  const [editMode, setEditMode] = useState(false);
  const [subInput, setSubInput] = useState("");
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setCategories(await adminApi.getCategories()); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditCat(emptyCategory); setEditMode(false); setSubInput(""); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditCat(cat); setEditMode(true); setSubInput(""); setShowModal(true); };

  const addSub = () => {
    if (!subInput.trim()) return;
    setEditCat(p => ({ ...p, subcategories: [...(p.subcategories || []), subInput.trim()] }));
    setSubInput("");
  };

  const removeSub = (i: number) => {
    setEditCat(p => ({ ...p, subcategories: (p.subcategories || []).filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!editCat.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const slug = editCat.slug || editCat.name!.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const payload = { ...editCat, slug };
      if (editMode && editCat.id) {
        const { id, created_at, ...rest } = payload as any;
        await adminApi.updateCategory(id, rest);
      } else {
        await adminApi.createCategory(payload);
      }
      toast({ title: editMode ? "Category Updated" : "Category Created" });
      setShowModal(false);
      loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await adminApi.deleteCategory(id); toast({ title: "Category Deleted" }); loadData(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-white">Categories</h1>
          <p className="text-white/30 text-xs mt-0.5">{categories.length} categories</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{cat.icon}</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <h3 className="font-heading font-semibold text-white text-sm">{cat.name}</h3>
            <p className="text-white/30 text-xs mt-0.5">{cat.product_count} products</p>
            {cat.subcategories?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {cat.subcategories.map((sub, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40">{sub}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Name *</label>
                <input value={editCat.name || ""} onChange={e => setEditCat(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Icon (Emoji)</label>
                  <input value={editCat.icon || ""} onChange={e => setEditCat(p => ({ ...p, icon: e.target.value }))} placeholder="🔧"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Product Count</label>
                  <input type="number" value={editCat.product_count || ""} onChange={e => setEditCat(p => ({ ...p, product_count: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Subcategories</label>
                <div className="flex gap-2">
                  <input value={subInput} onChange={e => setSubInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSub())}
                    placeholder="Add subcategory..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                  <Button onClick={addSub} size="sm" variant="outline" className="rounded-xl text-white/50 border-white/[0.08]">Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(editCat.subcategories || []).map((sub, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {sub}
                      <button onClick={() => removeSub(i)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Sort Order</label>
                <input type="number" value={editCat.sort_order || ""} onChange={e => setEditCat(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
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

export default AdminCategories;
