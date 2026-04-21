import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPromoBanners } from "@/lib/storeApi";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  emoji: string;
  cta_text: string;
  cta_link: string;
  bg_type: string;
}

const defaultBanners = [
  { id: "1", title: "Drone Starter Kits", subtitle: "Get up to 30% off on beginner-friendly drone kits. Build, fly, explore.", label: "Limited Offer", emoji: "🚁", cta_text: "Shop Drones", cta_link: "#", bg_type: "gradient-hero" },
  { id: "2", title: "3D Printers & Filaments", subtitle: "Explore our curated collection of 3D printers starting at ₹14,999.", label: "New Arrival", emoji: "🖨️", cta_text: "Explore Now", cta_link: "#", bg_type: "secondary" },
];

const PromoBar = () => {
  const [banners, setBanners] = useState<BannerData[]>(defaultBanners);
  const section = useScrollReveal();

  useEffect(() => {
    fetchPromoBanners().then((data) => {
      if (data) setBanners(data);
    });
  }, []);

  return (
    <section className="py-14 lg:py-20">
      <div className="container mx-auto px-4">
        <div ref={section.ref} className={`grid md:grid-cols-2 gap-5 stagger-children ${section.className}`}>
          {banners.slice(0, 2).map((banner) => (
            <div
              key={banner.id}
              className={`group relative rounded-2xl overflow-hidden p-8 lg:p-10 min-h-[200px] flex flex-col justify-center hover:-translate-y-1 transition-all duration-500 ${
                banner.bg_type === "gradient-hero"
                  ? "bg-gradient-hero"
                  : "bg-secondary border border-border"
              }`}
            >
              <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                {banner.emoji}
              </div>
              <p className={`font-heading font-bold text-xs uppercase tracking-wider mb-2 ${
                banner.bg_type === "gradient-hero" ? "text-primary" : "text-accent"
              }`}>
                {banner.label}
              </p>
              <h3 className={`font-heading font-bold text-xl lg:text-2xl mb-2 ${
                banner.bg_type === "gradient-hero" ? "text-surface-dark-foreground" : "text-foreground"
              }`}>
                {banner.title}
              </h3>
              <p className={`text-sm mb-5 max-w-xs ${
                banner.bg_type === "gradient-hero" ? "text-surface-dark-foreground/60" : "text-muted-foreground"
              }`}>
                {banner.subtitle}
              </p>
              {banner.bg_type === "gradient-hero" ? (
                <Button size="sm" className="bg-gradient-primary text-primary-foreground font-heading font-semibold w-fit hover:scale-105 transition-transform duration-300">
                  {banner.cta_text} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="font-heading font-semibold w-fit hover:scale-105 transition-transform duration-300">
                  {banner.cta_text} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBar;
