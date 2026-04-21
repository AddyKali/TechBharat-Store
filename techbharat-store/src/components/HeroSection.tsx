import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Zap, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchHeroSlides } from "@/lib/storeApi";

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  badge_text: string;
  cta_primary_text: string;
  cta_primary_link?: string;
  cta_secondary_text: string;
  cta_secondary_link?: string;
  background_image?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    title: "Build the Future with TechBharat",
    subtitle: "Explore Arduino, Raspberry Pi, Drone Parts, EV Kits, 3D Printing & more. Fast nationwide delivery with 24×7 support.",
    badge_text: "India's #1 Robotics & Electronics Store",
    cta_primary_text: "Shop Now",
    cta_secondary_text: "View Deals",
  },
];

const AUTOPLAY_MS = 5000;

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const touchStart = useRef(0);

  useEffect(() => {
    fetchHeroSlides().then((data) => {
      if (data && data.length > 0) setSlides(data);
      setTimeout(() => setLoaded(true), 100);
    });
  }, []);

  // Autoplay
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection("next");
      setCurrent((p) => (p + 1) % slides.length);
    }, AUTOPLAY_MS);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) startAutoplay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, startAutoplay]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? "next" : "prev");
    setCurrent(idx);
    startAutoplay();
  };

  const goPrev = () => {
    setDirection("prev");
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    startAutoplay();
  };

  const goNext = () => {
    setDirection("next");
    setCurrent((p) => (p + 1) % slides.length);
    startAutoplay();
  };

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  const renderTitle = (title: string) => {
    const parts = title.split("TechBharat");
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span
            className="animate-gradient-text"
            style={{
              background: "linear-gradient(135deg, hsl(28 95% 49%), hsl(35 95% 55%), hsl(28 95% 49%))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TechBharat
          </span>
          {parts[1]}
        </>
      );
    }
    return title;
  };

  return (
    <section className="relative overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Slide container */}
      <div className="relative min-h-[520px] lg:min-h-[580px]">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`hero-slide ${idx === current ? `hero-slide--active hero-slide--${direction}` : "hero-slide--hidden"}`}
          >
            {/* Background image */}
            {slide.background_image ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.background_image})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-hero" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-surface-dark/95 via-surface-dark/80 to-surface-dark/30" />

            {/* Floating decorative orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-80 h-80 rounded-full bg-primary/5 -top-40 -right-40 animate-float" />
              <div className="absolute w-52 h-52 rounded-full bg-accent/5 -bottom-24 -left-24 animate-float" style={{ animationDelay: "2s" }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 py-16 lg:py-20">
                <div className="max-w-2xl">
                  {/* Badge */}
                  {slide.badge_text && (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-6 backdrop-blur-sm border border-primary/20 transition-all duration-700 ${
                        idx === current && loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      {slide.badge_text}
                    </div>
                  )}

                  {/* Title */}
                  <h1
                    className={`font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-surface-dark-foreground leading-tight mb-5 transition-all duration-700 delay-150 ${
                      idx === current && loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                    }`}
                  >
                    {renderTitle(slide.title)}
                  </h1>

                  {/* Subtitle */}
                  <p
                    className={`text-lg md:text-xl text-surface-dark-foreground/70 mb-8 max-w-lg leading-relaxed transition-all duration-700 delay-300 ${
                      idx === current && loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Dots INSIDE banner content area */}
                  {slides.length > 1 && (
                    <div className={`flex items-center gap-2.5 transition-all duration-700 delay-[600ms] ${
                      idx === current && loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}>
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => goTo(dotIdx)}
                          className={`hero-dot ${dotIdx === current ? "hero-dot--active" : ""}`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Progress bar inside banner */}
        {slides.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
            <div
              className="h-full bg-gradient-to-r from-primary to-orange-400 hero-progress"
              key={current}
            />
          </div>
        )}
      </div>

      {/* Trust bar */}
      <div className="bg-card border-b border-border relative z-10">
        <div className="container mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck, text: "Free Shipping", sub: "On orders above ₹999" },
            { icon: ShieldCheck, text: "Secure Payments", sub: "SSL encrypted checkout" },
            { icon: Zap, text: "Fast Delivery", sub: "Same-day dispatch available" },
          ].map(({ icon: Icon, text, sub }, i) => (
            <div
              key={text}
              className={`flex items-center gap-3 justify-center transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${700 + i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{text}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
