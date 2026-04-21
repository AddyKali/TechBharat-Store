import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchCategories } from "@/lib/storeApi";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Product } from "@/data/mockData";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const heading = useScrollReveal();
  const grid = useScrollReveal();

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const urlSearch = searchParams.get("search") || "";

  // Sync search query from URL
  useEffect(() => {
    if (urlSearch) setSearchQuery(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ category: activeCategory || undefined }).then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, [activeCategory]);

  // Filter by tag + search
  useEffect(() => {
    let filtered = [...allProducts];

    if (activeTag) {
      const tagLower = activeTag.toLowerCase();
      if (tagLower === "new") {
        filtered = filtered.filter((p) => p.badge?.toLowerCase() === "new" || p.badge?.toLowerCase() === "hot");
      } else if (tagLower === "bestseller") {
        filtered = filtered.filter((p) => p.badge?.toLowerCase() === "bestseller" || p.badge?.toLowerCase() === "top rated");
      } else if (tagLower === "deal") {
        filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    setProducts(filtered);
  }, [allProducts, activeTag, searchQuery]);

  const pageTitle = activeCategory || (activeTag ? `${activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}` : "All Products");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-gradient-hero py-10">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-surface-dark-foreground mb-2">
              {pageTitle}
            </h1>
            <p className="text-surface-dark-foreground/60 text-sm">
              {products.length} products found
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-card rounded-xl border border-border p-5 shadow-card sticky top-32">
                <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-secondary/50 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Category pills */}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSearchParams({})}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !activeCategory && !activeTag ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSearchParams({ category: cat.name })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === cat.name ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Quick Tags */}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-5">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {["new", "bestseller", "deal"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchParams({ tag })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        activeTag === tag ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {tag === "new" ? "🆕 New" : tag === "bestseller" ? "⭐ Bestseller" : "🏷️ Deals"}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                      <div className="aspect-square bg-secondary/50 rounded-t-xl" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 bg-secondary rounded w-1/3" />
                        <div className="h-4 bg-secondary rounded w-2/3" />
                        <div className="h-4 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🔍</p>
                  <h3 className="font-heading font-semibold text-lg mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="outline" onClick={() => setSearchParams({})}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div ref={grid.ref} className={`grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children ${grid.className}`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
