import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchFooterLinks } from "@/lib/storeApi";

interface FooterLink {
  id: string;
  section: string;
  label: string;
  href: string;
}

const defaultLinks: Record<string, FooterLink[]> = {
  Shop: [
    { id: "s1", section: "Shop", label: "Arduino", href: "/products?category=arduino" },
    { id: "s2", section: "Shop", label: "Raspberry Pi", href: "/products?category=raspberry-pi" },
    { id: "s3", section: "Shop", label: "Drone Parts", href: "/products?category=drone-parts" },
    { id: "s4", section: "Shop", label: "3D Printing", href: "/products?category=3d-printing" },
    { id: "s5", section: "Shop", label: "EV Components", href: "/products?category=ev-components" },
    { id: "s6", section: "Shop", label: "Sensors", href: "/products?category=sensors" },
  ],
  Support: [
    { id: "u1", section: "Support", label: "Help Center", href: "/help" },
    { id: "u2", section: "Support", label: "Track Order", href: "/track-order" },
    { id: "u3", section: "Support", label: "Shipping Info", href: "/shipping" },
    { id: "u4", section: "Support", label: "Returns", href: "/returns" },
    { id: "u5", section: "Support", label: "Warranty", href: "/warranty" },
    { id: "u6", section: "Support", label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { id: "c1", section: "Company", label: "About Us", href: "/about" },
    { id: "c2", section: "Company", label: "Careers", href: "/careers" },
    { id: "c3", section: "Company", label: "Blog", href: "/blog" },
    { id: "c4", section: "Company", label: "Press", href: "/press" },
    { id: "c5", section: "Company", label: "Partners", href: "/partners" },
    { id: "c6", section: "Company", label: "Affiliates", href: "/affiliates" },
  ],
};

const Footer = () => {
  const [sections, setSections] = useState<Record<string, FooterLink[]>>(defaultLinks);

  useEffect(() => {
    fetchFooterLinks().then((data: FooterLink[]) => {
      if (data && data.length > 0) {
        const grouped: Record<string, FooterLink[]> = {};
        data.forEach((link) => {
          if (!grouped[link.section]) grouped[link.section] = [];
          grouped[link.section].push(link);
        });
        setSections(grouped);
      }
    });
  }, []);

  return (
    <footer className="bg-surface-dark text-surface-dark-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold">T</span>
              </div>
              <div>
                <span className="font-heading font-bold text-surface-dark-foreground">Tech</span>
                <span className="font-heading font-bold text-primary">Bharat</span>
              </div>
            </div>
            <p className="text-sm text-surface-dark-foreground/50 leading-relaxed mb-4">
              India's leading online store for robotics, electronics & maker supplies.
            </p>
            <div className="flex gap-3">
              {[
                { icon: "𝕏", href: "https://twitter.com" },
                { icon: "f", href: "https://facebook.com" },
                { icon: "in", href: "https://linkedin.com" },
                { icon: "▶", href: "https://youtube.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-surface-dark-foreground/10 flex items-center justify-center text-xs font-bold text-surface-dark-foreground/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic link columns */}
          {Object.entries(sections).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm mb-4 text-surface-dark-foreground">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.href}
                      className="text-sm text-surface-dark-foreground/50 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-surface-dark-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-dark-foreground/40">
            © 2026 TechBharat Store. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-surface-dark-foreground/40">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
