import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Products from "./pages/Products.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./pages/AdminLayout.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminProducts from "./pages/AdminProducts.tsx";
import AdminCategories from "./pages/AdminCategories.tsx";
import AdminHero from "./pages/AdminHero.tsx";
import AdminPromos from "./pages/AdminPromos.tsx";
import AdminCoupons from "./pages/AdminCoupons.tsx";
import AdminOrders from "./pages/AdminOrders.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import AdminNavigation from "./pages/AdminNavigation.tsx";
import AdminTestimonials from "./pages/AdminTestimonials.tsx";
import AdminFooter from "./pages/AdminFooter.tsx";
import CursorGlow from "./components/CursorGlow.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <CursorGlow />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/products" element={<Products />} />

              {/* Admin Panel Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/hero" element={<AdminHero />} />
                <Route path="/admin/promos" element={<AdminPromos />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/navigation" element={<AdminNavigation />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/footer" element={<AdminFooter />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
