import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Newsletter = () => {
  const section = useScrollReveal();

  return (
    <section className="py-14 lg:py-20 bg-gradient-hero relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-80 h-80 rounded-full bg-primary/5 -top-40 -right-40 animate-float" />
        <div className="absolute w-60 h-60 rounded-full bg-accent/5 -bottom-30 -left-30 animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div ref={section.ref} className={`container mx-auto px-4 text-center relative reveal ${section.className}`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4 border border-primary/20">
          <Sparkles className="w-3 h-3" /> Never miss a deal
        </div>
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-surface-dark-foreground mb-3">
          Stay in the Loop
        </h2>
        <p className="text-surface-dark-foreground/60 text-sm mb-8 max-w-md mx-auto">
          Get exclusive deals, new product alerts, and maker tips delivered to your inbox.
        </p>
        <div className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-surface-dark-foreground/10 border border-surface-dark-foreground/10 text-surface-dark-foreground text-sm placeholder:text-surface-dark-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 focus:bg-surface-dark-foreground/15"
          />
          <Button className="bg-gradient-primary text-primary-foreground font-heading font-semibold px-6 hover:scale-105 hover:shadow-lg transition-all duration-300">
            <Send className="w-4 h-4 mr-2" />
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
