import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { fetchTestimonials } from "@/lib/storeApi";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Testimonial {
  id: string;
  name: string;
  avatar_url: string;
  rating: number;
  review: string;
  time_ago: string;
}

const defaultTestimonials: Testimonial[] = [
  { id: "1", name: "Jaisimha A G", avatar_url: "", rating: 5, review: "A pretty well organized warehouse for most hobby electronic components and modules. Your online shopping experience is comfortable and convenient", time_ago: "a month ago" },
  { id: "2", name: "Anirban Bandyopadhyay", avatar_url: "", rating: 5, review: "With the price, service, and guidance, TechBharat is a complete package for your needs", time_ago: "a month ago" },
  { id: "3", name: "Varun Wahi", avatar_url: "", rating: 5, review: "Great customer service. I am very impressed with the quick replies and actions to all my queries.", time_ago: "3 weeks ago" },
];

const Testimonials = () => {
  const [items, setItems] = useState<Testimonial[]>(defaultTestimonials);
  const heading = useScrollReveal();
  const grid = useScrollReveal();

  useEffect(() => {
    fetchTestimonials().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-14 lg:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div ref={heading.ref} className={`text-center mb-12 reveal ${heading.className}`}>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
            TESTIMONIALS
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            What our customers say about us
          </p>
        </div>

        <div ref={grid.ref} className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children ${grid.className}`}>
          {items.map((t) => (
            <div
              key={t.id}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors duration-300" />

              {/* Header: Avatar + Name + Rating */}
              <div className="flex items-center gap-3 mb-4">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center text-primary font-heading font-bold text-sm border border-primary/15">
                    {getInitials(t.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-sm text-foreground truncate">{t.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t.time_ago}</span>
                  </div>
                </div>
                {/* Google icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-60 transition-opacity">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>

              {/* Review text */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {t.review}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
