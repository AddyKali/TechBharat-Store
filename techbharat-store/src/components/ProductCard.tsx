import { useState } from "react";
import { Star, ShoppingCart, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/data/mockData";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      addToCart(product, 1);
      setIsAdded(true);
      
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
        duration: 2000,
      });

      // Reset button state after 2 seconds
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary/50 animate-pulse" />
        )}

        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground shadow-sm">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold bg-success text-success-foreground shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <button className="p-2 rounded-full bg-white/90 text-foreground shadow-lg hover:bg-primary hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary mb-1.5">
          {product.category}
        </p>
        <h3 className="font-heading font-semibold text-sm text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 transition-transform duration-300 ${i < Math.floor(product.rating) ? "fill-highlight text-highlight group-hover:scale-110" : "text-border"}`}
                style={{ transitionDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-heading font-bold text-lg text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1.5">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`w-9 h-9 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
              isAdded
                ? "bg-success text-success-foreground"
                : "bg-primary text-primary-foreground hover:shadow-md"
            }`}
          >
            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
