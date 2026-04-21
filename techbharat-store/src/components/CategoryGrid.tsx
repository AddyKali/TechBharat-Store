import { useState, useEffect } from "react";
import { fetchCategories } from "@/lib/storeApi";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  subcategories: string[];
}

// Animated SVG icons per category
const categoryIcons: Record<string, JSX.Element> = {
  Arduino: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <rect x="8" y="14" width="32" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="cat-board" />
      <circle cx="16" cy="24" r="2" fill="currentColor" className="cat-chip animate-pulse" />
      <circle cx="24" cy="24" r="2" fill="currentColor" className="cat-chip animate-pulse" style={{ animationDelay: "0.3s" }} />
      <circle cx="32" cy="24" r="2" fill="currentColor" className="cat-chip animate-pulse" style={{ animationDelay: "0.6s" }} />
      <line x1="12" y1="14" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-pin" />
      <line x1="20" y1="14" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-pin" />
      <line x1="28" y1="14" x2="28" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-pin" />
      <line x1="36" y1="14" x2="36" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-pin" />
    </svg>
  ),
  "Raspberry Pi": (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <rect x="10" y="10" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="cat-board" />
      <rect x="16" y="16" width="8" height="8" rx="1" fill="currentColor" className="cat-chip animate-pulse" />
      <circle cx="34" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="cat-port" />
      <circle cx="34" cy="22" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="cat-port" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="cat-trace" />
      <line x1="16" y1="34" x2="32" y2="34" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="cat-trace" />
    </svg>
  ),
  "Drone Parts": (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <circle cx="24" cy="24" r="4" fill="none" stroke="currentColor" strokeWidth="2" className="cat-body" />
      <line x1="24" y1="20" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-arm" />
      <line x1="24" y1="20" x2="34" y2="10" stroke="currentColor" strokeWidth="1.5" className="cat-arm" />
      <line x1="24" y1="28" x2="14" y2="38" stroke="currentColor" strokeWidth="1.5" className="cat-arm" />
      <line x1="24" y1="28" x2="34" y2="38" stroke="currentColor" strokeWidth="1.5" className="cat-arm" />
      <circle cx="14" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1" className="cat-prop" />
      <circle cx="34" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1" className="cat-prop" />
      <circle cx="14" cy="38" r="5" fill="none" stroke="currentColor" strokeWidth="1" className="cat-prop" />
      <circle cx="34" cy="38" r="5" fill="none" stroke="currentColor" strokeWidth="1" className="cat-prop" />
    </svg>
  ),
  "3D Printing": (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <rect x="10" y="28" width="28" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" className="cat-base" />
      <path d="M18 28 L18 16 L30 16 L30 28" fill="none" stroke="currentColor" strokeWidth="1.5" className="cat-frame" />
      <line x1="24" y1="16" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" className="cat-nozzle" />
      <rect x="20" y="22" width="8" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" className="cat-print animate-pulse" />
      <circle cx="24" cy="22" r="1.5" fill="currentColor" className="cat-drop animate-bounce" />
    </svg>
  ),
  "EV Components": (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <rect x="14" y="12" width="20" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="cat-battery" />
      <rect x="20" y="8" width="8" height="4" rx="1" fill="currentColor" className="cat-terminal" />
      <path d="M22 22 L26 28 L22 28 L26 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cat-bolt" />
      <rect x="18" y="16" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" className="cat-level animate-pulse" />
    </svg>
  ),
  Sensors: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="2" className="cat-sensor" />
      <circle cx="24" cy="24" r="2" fill="currentColor" className="cat-core animate-pulse" />
      <path d="M14 24 C14 18, 18 14, 24 14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="cat-wave" />
      <path d="M10 24 C10 15, 15 10, 24 10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" className="cat-wave" />
      <path d="M34 24 C34 30, 30 34, 24 34" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" className="cat-wave" />
      <path d="M38 24 C38 33, 33 38, 24 38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" className="cat-wave" />
    </svg>
  ),
  Batteries: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <rect x="12" y="16" width="24" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="cat-cell" />
      <rect x="36" y="22" width="4" height="8" rx="1" fill="currentColor" className="cat-terminal" />
      <rect x="16" y="20" width="4" height="10" rx="1" fill="currentColor" opacity="0.6" className="cat-bar animate-pulse" />
      <rect x="22" y="20" width="4" height="10" rx="1" fill="currentColor" opacity="0.4" className="cat-bar animate-pulse" style={{ animationDelay: "0.3s" }} />
      <rect x="28" y="20" width="4" height="10" rx="1" fill="currentColor" opacity="0.2" className="cat-bar animate-pulse" style={{ animationDelay: "0.6s" }} />
    </svg>
  ),
  "Tools & Equipment": (
    <svg viewBox="0 0 48 48" className="w-12 h-12 cat-icon">
      <path d="M14 34 L22 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cat-handle" />
      <circle cx="26" cy="22" r="6" fill="none" stroke="currentColor" strokeWidth="2" className="cat-gear" />
      <circle cx="26" cy="22" r="2" fill="currentColor" className="cat-center" />
      <path d="M34 14 L38 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cat-wrench" />
      <path d="M32 16 C36 12 40 16 36 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="cat-jaw" />
    </svg>
  ),
};

// Floating particles per category
const categoryParticles: Record<string, string[]> = {
  Arduino: ["⚡", "🔌", "💡"],
  "Raspberry Pi": ["🍓", "💻", "📡"],
  "Drone Parts": ["🚁", "🌀", "📷"],
  "3D Printing": ["🎯", "⚙️", "🔧"],
  "EV Components": ["🔋", "⚡", "🔌"],
  Sensors: ["📡", "🌡️", "💨"],
  Batteries: ["🔋", "⚡", "🔌"],
  "Tools & Equipment": ["🔧", "🛠️", "⚙️"],
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const heading = useScrollReveal();
  const grid = useScrollReveal();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <section className="py-14 lg:py-20">
      <div className="container mx-auto px-4">
        <div ref={heading.ref} className={`text-center mb-10 reveal ${heading.className}`}>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Browse our extensive collection across 50+ categories
          </p>
        </div>

        <div ref={grid.ref} className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 stagger-children ${grid.className}`}>
          {categories.map((cat) => {
            const icon = categoryIcons[cat.name];
            const particles = categoryParticles[cat.name] || ["✨", "⚡", "🔌"];
            const isHovered = hoveredId === cat.id;

            return (
              <a
                key={cat.id}
                href="#"
                className="cat-card group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-500 text-center overflow-hidden"
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Animated background glow */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
                  style={{ background: "radial-gradient(circle at 50% 30%, hsl(28 95% 49% / 0.06) 0%, transparent 70%)" }}
                />

                {/* Floating particles on hover */}
                {isHovered && particles.map((p, i) => (
                  <span
                    key={i}
                    className="absolute text-sm pointer-events-none cat-particle"
                    style={{
                      left: `${20 + i * 25}%`,
                      top: `${15 + (i % 2) * 40}%`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  >
                    {p}
                  </span>
                ))}

                {/* Icon */}
                <div className={`relative z-10 mb-3 flex justify-center text-muted-foreground group-hover:text-primary transition-all duration-500 ${isHovered ? "scale-110" : "scale-100"}`}>
                  {icon || <span className="text-3xl">{cat.icon}</span>}
                </div>

                {/* Name */}
                <h3 className="relative z-10 font-heading font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                  {cat.name}
                </h3>
                <p className="relative z-10 text-xs text-muted-foreground">{cat.productCount} products</p>

                {/* Bottom line animation */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-500 ${isHovered ? "w-3/4 opacity-100" : "w-0 opacity-0"}`} />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
