import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface FooterLink {
  id: string;
  section: string;
  label: string;
  href: string;
  is_active: boolean;
  sort_order: number;
}

const empty: Partial<FooterLink> = {
  section: "Shop", label: "", href: "#", is_active: true, sort_order: 0,
};

const SECTIONS = ["Shop", "Support", "Company"];

const AdminFooter = () => {
  const [items, setItems] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<FooterLink>>(empty);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setItems(await adminApi.getFooterLinks()); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openNew = (section?: string) => { setEditItem({ ...empty, section: section || "Shop" }); setEditMode(false); setShowModal(true); };
  const openEdit = (item: FooterLink) => { setEditItem(item); setEditMode(true); setShowModal(true); };

  const handleSave = async () => {
    if (!editItem.label) { toast({ title: "Label is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editMode && editItem.id) {
        const { id, created_at, ...rest } = editItem as any;
        await adminApi.updateFooterLink(id, rest);
      } else {
        await adminApi.createFooterLink(editItem);
      }
      toast({ title: editMode ? "Updated" : "Created" });
      setShowModal(false); loadData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this footer link?")) return;
    try { await adminApi.deleteFooterLink(id); toast({ title: "Deleted" }); loadData(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const filtered = activeSection === "all" ? items : items.filter(i => i.section === activeSection);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-white">Footer Links</h1>
          <p className="text-white/30 text-xs mt-0.5">Manage footer navigation sections and links</p>
        </div>
        <Button onClick={() => openNew()} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Link
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-2">
        {["all", ...SECTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === s ? "bg-primary/10 text-primary" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            {s === "all" ? "All" : s} ({s === "all" ? items.length : items.filter(i => i.section === s).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className={`bg-white/[0.03] border rounded-xl px-4 py-3 flex items-center justify-between transition-all ${item.is_active ? "border-white/[0.06]" : "border-white/[0.04] opacity-50"}`}>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.section}</span>
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="text-white/20 text-xs">{item.href}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary transition-all"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center text-white/20 text-sm">No links in this section.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit Link" : "Add Link"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Section *</label>
                <select value={editItem.section || "Shop"} onChange={e => setEditItem(p => ({ ...p, section: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Label *</label>
                <input value={editItem.label || ""} onChange={e => setEditItem(p => ({ ...p, label: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Link URL</label>
                <input value={editItem.href || ""} onChange={e => setEditItem(p => ({ ...p, href: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Order</label>
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

export default AdminFooter;
