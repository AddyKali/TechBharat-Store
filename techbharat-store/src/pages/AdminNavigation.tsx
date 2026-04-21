import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Link2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface NavLink {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
}

interface MegaMenuSection {
  id: string;
  title: string;
  items: { name: string; href: string }[];
  sort_order: number;
  is_active: boolean;
}

const AdminNavigation = () => {
  const { toast } = useToast();
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [megaMenu, setMegaMenu] = useState<MegaMenuSection[]>([]);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [editingMenu, setEditingMenu] = useState<MegaMenuSection | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ label: "", href: "/products", sort_order: 0, is_active: true });
  const [menuForm, setMenuForm] = useState({ title: "", items: [{ name: "", href: "" }], sort_order: 0, is_active: true });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [links, menus] = await Promise.all([
        adminApi.getNavLinks(),
        adminApi.getMegaMenu(),
      ]);
      setNavLinks(links);
      setMegaMenu(menus);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  // ====== NAV LINKS ======
  function openAddLink() {
    setEditingLink(null);
    setLinkForm({ label: "", href: "/products", sort_order: navLinks.length + 1, is_active: true });
    setShowLinkModal(true);
  }

  function openEditLink(link: NavLink) {
    setEditingLink(link);
    setLinkForm({ label: link.label, href: link.href, sort_order: link.sort_order, is_active: link.is_active });
    setShowLinkModal(true);
  }

  async function saveLink() {
    try {
      if (editingLink) {
        await adminApi.updateNavLink(editingLink.id, linkForm);
        toast({ title: "Link updated" });
      } else {
        await adminApi.createNavLink(linkForm);
        toast({ title: "Link created" });
      }
      setShowLinkModal(false);
      loadData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this link?")) return;
    await adminApi.deleteNavLink(id);
    toast({ title: "Link deleted" });
    loadData();
  }

  async function toggleLinkActive(link: NavLink) {
    await adminApi.updateNavLink(link.id, { is_active: !link.is_active });
    loadData();
  }

  // ====== MEGA MENU ======
  function openAddMenu() {
    setEditingMenu(null);
    setMenuForm({ title: "", items: [{ name: "", href: "" }], sort_order: megaMenu.length + 1, is_active: true });
    setShowMenuModal(true);
  }

  function openEditMenu(menu: MegaMenuSection) {
    setEditingMenu(menu);
    setMenuForm({ title: menu.title, items: menu.items.length > 0 ? menu.items : [{ name: "", href: "" }], sort_order: menu.sort_order, is_active: menu.is_active });
    setShowMenuModal(true);
  }

  async function saveMenu() {
    try {
      const cleanItems = menuForm.items.filter((i) => i.name.trim());
      const payload = { ...menuForm, items: cleanItems };
      if (editingMenu) {
        await adminApi.updateMegaMenu(editingMenu.id, payload);
        toast({ title: "Menu section updated" });
      } else {
        await adminApi.createMegaMenu(payload);
        toast({ title: "Menu section created" });
      }
      setShowMenuModal(false);
      loadData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function deleteMenu(id: string) {
    if (!confirm("Delete this menu section?")) return;
    await adminApi.deleteMegaMenu(id);
    toast({ title: "Menu section deleted" });
    loadData();
  }

  function addMenuItem() {
    setMenuForm({ ...menuForm, items: [...menuForm.items, { name: "", href: "" }] });
  }

  function removeMenuItem(index: number) {
    setMenuForm({ ...menuForm, items: menuForm.items.filter((_, i) => i !== index) });
  }

  function updateMenuItem(index: number, field: "name" | "href", value: string) {
    const items = [...menuForm.items];
    items[index] = { ...items[index], [field]: value };
    setMenuForm({ ...menuForm, items });
  }

  return (
    <div className="space-y-8">
      {/* NAV LINKS Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">Navigation Links</h2>
            <p className="text-sm text-muted-foreground">Top navbar items (New Arrivals, Bestsellers, etc.)</p>
          </div>
          <Button onClick={openAddLink} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {navLinks.map((link) => (
                <tr key={link.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{link.label}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{link.href}</td>
                  <td className="px-4 py-3 text-sm">{link.sort_order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleLinkActive(link)} className={`px-2 py-0.5 rounded text-[10px] font-bold ${link.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {link.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditLink(link)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4 inline" /></button>
                    <button onClick={() => deleteLink(link.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
              {navLinks.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No nav links yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEGA MENU Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">Mega Menu Sections</h2>
            <p className="text-sm text-muted-foreground">Dropdown menu columns (Development Boards, Robotics, etc.)</p>
          </div>
          <Button onClick={openAddMenu} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Add Section
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {megaMenu.map((section) => (
            <div key={section.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-sm">{section.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openEditMenu(section)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteMenu(section.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link2 className="w-3 h-3" />
                    <span>{item.name}</span>
                    <span className="text-[10px] font-mono opacity-50 ml-auto">{item.href}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>Order: {section.sort_order}</span>
                <span className={section.is_active ? "text-green-400" : "text-red-400"}>
                  {section.is_active ? "● Active" : "● Hidden"}
                </span>
              </div>
            </div>
          ))}
          {megaMenu.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">No mega menu sections yet.</div>
          )}
        </div>
      </div>

      {/* NAV LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLinkModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-4">{editingLink ? "Edit Link" : "Add Link"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Label *</label>
                <input value={linkForm.label} onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm" placeholder="e.g. New Arrivals" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">URL *</label>
                <input value={linkForm.href} onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm font-mono" placeholder="/products?tag=new" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sort Order</label>
                  <input type="number" value={linkForm.sort_order} onChange={(e) => setLinkForm({ ...linkForm, sort_order: parseInt(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm" />
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={linkForm.is_active} onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })} className="rounded" />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowLinkModal(false)}>Cancel</Button>
              <Button onClick={saveLink} className="bg-primary text-primary-foreground" disabled={!linkForm.label.trim()}>
                {editingLink ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MEGA MENU MODAL */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowMenuModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-lg border border-border max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-4">{editingMenu ? "Edit Menu Section" : "Add Menu Section"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Section Title *</label>
                <input value={menuForm.title} onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm" placeholder="e.g. Development Boards" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Menu Items</label>
                {menuForm.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={item.name} onChange={(e) => updateMenuItem(i, "name", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm" placeholder="Link name" />
                    <input value={item.href} onChange={(e) => updateMenuItem(i, "href", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm font-mono" placeholder="/products?category=..." />
                    {menuForm.items.length > 1 && (
                      <button onClick={() => removeMenuItem(i)} className="text-destructive hover:text-destructive/80 px-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addMenuItem} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Sort Order</label>
                  <input type="number" value={menuForm.sort_order} onChange={(e) => setMenuForm({ ...menuForm, sort_order: parseInt(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm" />
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={menuForm.is_active} onChange={(e) => setMenuForm({ ...menuForm, is_active: e.target.checked })} className="rounded" />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowMenuModal(false)}>Cancel</Button>
              <Button onClick={saveMenu} className="bg-primary text-primary-foreground" disabled={!menuForm.title.trim()}>
                {editingMenu ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavigation;
