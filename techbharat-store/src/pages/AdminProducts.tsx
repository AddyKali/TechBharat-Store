import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Search, Upload, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge: string | null;
  in_stock: boolean;
  description: string;
  featured: boolean;
}

const emptyProduct: Partial<Product> = {
  name: "", price: 0, original_price: null, image: "",
  category: "", rating: 0, reviews: 0, badge: null,
  in_stock: true, description: "", featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product>>(emptyProduct);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditProduct(emptyProduct);
    setEditMode(false);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditMode(true);
    setImagePreview(product.image || "");
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await adminApi.uploadImage(file);
      setEditProduct(prev => ({ ...prev, image: url }));
      setImagePreview(url);
      toast({ title: "Image uploaded" });
    } catch {
      // Fallback: use local preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setEditProduct(prev => ({ ...prev, image: url }));
        setImagePreview(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editProduct.name || !editProduct.price) {
      toast({ title: "Validation Error", description: "Name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editMode && editProduct.id) {
        const { id, created_at, updated_at, ...rest } = editProduct as any;
        await adminApi.updateProduct(id, rest);
        toast({ title: "Product Updated" });
      } else {
        await adminApi.createProduct(editProduct);
        toast({ title: "Product Created" });
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      toast({ title: "Product Deleted" });
      loadProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-bold text-xl text-white">Products</h1>
          <p className="text-white/30 text-xs mt-0.5">{products.length} products total</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Stock</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Featured</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.05] shrink-0">
                        {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                        {product.badge && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">{product.badge}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/50 text-sm">{product.category}</td>
                  <td className="px-5 py-3">
                    <span className="text-white text-sm font-medium">₹{product.price?.toLocaleString("en-IN")}</span>
                    {product.original_price && (
                      <span className="text-white/20 text-xs line-through ml-1">₹{product.original_price.toLocaleString("en-IN")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.in_stock ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {product.in_stock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {product.featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-primary transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(220,20%,10%)] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg text-white">{editMode ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Product Name *</label>
                <input value={editProduct.name || ""} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Price (₹) *</label>
                <input type="number" value={editProduct.price || ""} onChange={e => setEditProduct(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Original Price (₹)</label>
                <input type="number" value={editProduct.original_price || ""} onChange={e => setEditProduct(p => ({ ...p, original_price: parseFloat(e.target.value) || null }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Category</label>
                <input value={editProduct.category || ""} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Badge</label>
                <input value={editProduct.badge || ""} onChange={e => setEditProduct(p => ({ ...p, badge: e.target.value || null }))} placeholder="e.g. Bestseller, New, Deal"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={editProduct.rating || ""} onChange={e => setEditProduct(p => ({ ...p, rating: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Reviews Count</label>
                <input type="number" value={editProduct.reviews || ""} onChange={e => setEditProduct(p => ({ ...p, reviews: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Product Image</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input value={editProduct.image || ""} onChange={e => { setEditProduct(p => ({ ...p, image: e.target.value })); setImagePreview(e.target.value); }}
                      placeholder="Image URL or upload..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.08] transition-all inline-flex items-center gap-2">
                      <Upload className="w-3 h-3" /> Upload Image
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                  {imagePreview && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={editProduct.description || ""} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editProduct.in_stock ?? true} onChange={e => setEditProduct(p => ({ ...p, in_stock: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.08] text-primary focus:ring-primary" />
                  <span className="text-white/60 text-sm">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editProduct.featured ?? false} onChange={e => setEditProduct(p => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.08] text-primary focus:ring-primary" />
                  <span className="text-white/60 text-sm">Featured</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <Button onClick={() => setShowModal(false)} variant="ghost" className="text-white/40 hover:text-white">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
