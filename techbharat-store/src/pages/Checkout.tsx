import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ArrowLeft, MapPin, User, Mail, Phone, Ticket, Loader2, X } from 'lucide-react';
import { validateCoupon } from '@/lib/storeApi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <h2 className="text-xl font-semibold mb-2">No Items in Cart</h2>
            <p className="text-muted-foreground mb-6">
              Please add items to your cart before checking out
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Back to Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>

            <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-1">Order ID:</p>
              <p className="font-mono font-bold text-lg break-all">
                #{Date.now().toString().slice(-12)}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Expected delivery: 5-7 business days
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
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
      setAppliedCoupon({ code: result.coupon.code, discount: result.discount, description: result.coupon.description });
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!fullName || !address || !city || !state || !pincode) {
        throw new Error('Please fill in all required fields');
      }

      if (!pincode.match(/^\d{6}$/)) {
        throw new Error('Pincode must be 6 digits');
      }

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user profile with address
      updateUserProfile({
        name: fullName,
        address,
        city,
        state,
        pincode,
        phone,
      });

      // Clear cart
      clearCart();

      // Show success
      setOrderPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder={email}
                      disabled
                      className="bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Street Address *
                    </label>
                    <Input
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={loading}
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City *
                      </label>
                      <Input
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={loading}
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State *
                      </label>
                      <Input
                        type="text"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={loading}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pincode *
                    </label>
                    <Input
                      type="text"
                      placeholder="110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      className="bg-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { value: 'card', label: 'Credit/Debit Card' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'cod', label: 'Cash on Delivery' },
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={loading}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base"
              >
                {loading ? 'Processing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto border-b pb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="border-b pb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Ticket className="w-4 h-4" /> Coupon Code</p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</p>
                        <p className="text-xs text-emerald-600">-₹{appliedCoupon.discount.toLocaleString('en-IN')} off</p>
                      </div>
                      <button onClick={removeCoupon} className="text-emerald-600 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="bg-white font-mono" />
                        <Button onClick={handleApplyCoupon} disabled={couponLoading} variant="outline" size="sm" className="shrink-0">
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-2">
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

                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
