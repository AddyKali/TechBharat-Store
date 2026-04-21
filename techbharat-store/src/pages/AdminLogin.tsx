import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if already logged in — must be inside useEffect, not render
  useEffect(() => {
    if (adminApi.getToken()) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.login(email, password);
      toast({ title: "Welcome back, Admin!", description: "Redirecting to dashboard..." });
      navigate("/admin/dashboard");
    } catch {
      toast({ title: "Login Failed", description: "Invalid email or password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth to avoid flash
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,7%)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,7%)] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 mb-4 shadow-[0_0_40px_rgba(234,88,12,0.3)]">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">
            Tech<span className="text-primary">Bharat</span> Admin
          </h1>
          <p className="text-white/40 text-sm mt-1">Store Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techbharat.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 h-12 bg-gradient-to-r from-primary to-orange-600 text-white font-heading font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(234,88,12,0.3)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-white/20 text-xs text-center">
              Protected area. Only authorized administrators can access this panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
