import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { validateCoupon } from '@/lib/storeApi';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Ticket, Loader2, X } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in or create an account to view your cart
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartTotal = getCartTotal();
  const discountAmount = appliedCoupon?.discount || 0;
  const afterDiscount = cartTotal - discountAmount;
  const taxAmount = afterDiscount * 0.05;
  const finalTotal = afterDiscount + taxAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const result = await validateCoupon(couponCode.trim(), cartTotal);
      setAppliedCoupon({
        code: result.coupon.code,
        discount: result.discount,
        description: result.coupon.description,
      });
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started!
            </p>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.product.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-lg">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>

                          {/* Quantity Control */}
                          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-white rounded transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-white rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-foreground mt-2">
                          Subtotal: ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coupon Code — uses backend validation */}
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" /> Apply Coupon
                    </p>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</p>
                          <p className="text-xs text-emerald-600">-₹{appliedCoupon.discount.toLocaleString('en-IN')} off</p>
                        </div>
                        <button onClick={removeCoupon} className="text-emerald-600 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="text-sm font-mono"
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                          </Button>
                        </div>
                        {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          Use coupons created in Admin Panel
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₹0 (Free)</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span>₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>

                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-primary/90 text-white h-10"
                  >
                    Proceed to Checkout
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
