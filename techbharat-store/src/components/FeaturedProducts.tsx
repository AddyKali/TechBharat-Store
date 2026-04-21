import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/storeApi";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Product } from "@/data/mockData";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const heading = useScrollReveal();
  const grid = useScrollReveal();

  useEffect(() => {
    fetchProducts({ featured: true }).then(setProducts);
  }, []);

  return (
    <section className="py-14 lg:py-20 bg-surface-warm">
      <div className="container mx-auto px-4">
        <div ref={heading.ref} className={`flex items-end justify-between mb-10 reveal ${heading.className}`}>
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
              Trending Products
            </h2>
            <p className="text-muted-foreground text-sm">
              Handpicked bestsellers loved by makers across India
            </p>
          </div>
          <a href="#" className="hidden sm:inline-flex text-sm font-semibold text-primary hover:underline">
            View All →
          </a>
        </div>

        <div ref={grid.ref} className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 stagger-children ${grid.className}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
