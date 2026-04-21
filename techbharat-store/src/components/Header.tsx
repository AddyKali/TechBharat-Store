import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchNavigation } from "@/lib/storeApi";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLink {
  label: string;
  href: string;
}

interface MegaSection {
  title: string;
  items: { name: string; href: string }[];
}

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [megaMenu, setMegaMenu] = useState<MegaSection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { getCartItemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const cartCount = getCartItemCount();

  useEffect(() => {
    fetchNavigation().then((data) => {
      setNavLinks(data.navLinks || []);
      setMegaMenu(data.megaMenu || []);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">

      {/* Main header */}
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/images/logo.png" alt="TechBharat" className="w-9 h-9 object-contain" />
          <div className="hidden sm:block">
            <span className="font-heading font-bold text-lg text-foreground">Tech</span>
            <span className="font-heading font-bold text-lg text-primary">Bharat</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Arduino, Raspberry Pi, Sensors..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/order-history")}>
                  Order History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/auth")}
              className="hidden sm:flex"
            >
              <User className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation — dynamic */}
      <nav className="hidden md:block border-t border-border">
        <div className="container mx-auto px-4 flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium hover:text-primary transition-colors">
              <Menu className="w-4 h-4" />
              All Categories
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {megaMenuOpen && megaMenu.length > 0 && (
              <div className="absolute top-full left-0 w-[700px] bg-card rounded-lg shadow-lg border border-border p-6 grid grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                {megaMenu.map((section) => (
                  <div key={section.title}>
                    <h4 className="font-heading font-semibold text-sm mb-2 text-foreground">{section.title}</h4>
                    <ul className="space-y-1.5">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3 animate-in slide-in-from-top-2">
          <Link
            to="/products"
            className="block py-2 text-sm font-medium text-foreground hover:text-primary"
            onClick={() => setMobileOpen(false)}
          >
            All Products
          </Link>
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate("/cart")}
                >
                  Cart ({cartCount})
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigate("/auth");
                    setMobileOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    navigate("/auth");
                    setMobileOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
