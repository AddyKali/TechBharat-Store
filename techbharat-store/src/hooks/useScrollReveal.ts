import { useEffect, useRef, useState } from "react";

/**
 * Hook that adds "visible" class when element scrolls into view.
 * Use with CSS classes: reveal, hero-reveal, scale-reveal, stagger-children
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible, className: visible ? "visible" : "" };
}
