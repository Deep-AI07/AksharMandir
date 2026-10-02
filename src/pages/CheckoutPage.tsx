import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { Address, Order } from '../types';
import { 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Building2, 
  Truck, 
  Sparkles, 
  Check, 
  Clock, 
  Download,
  ShoppingBag
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    user, 
    cartSubtotal, 
    cartDiscount, 
    cartTotal, 
    appliedCoupon, 
    placeOrder, 
    formatPrice, 
    brandConfig,
    navigateTo 
  } = useApp();

  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [streetAddress, setStreetAddress] = useState(user.addresses[0]?.streetAddress || '');
  const [apartment, setApartment] = useState(user.addresses[0]?.apartment || '');
  const [city, setCity] = useState(user.addresses[0]?.city || 'Bengaluru');
  const [state, setState] = useState(user.addresses[0]?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user.addresses[0]?.pincode || '560038');
  const [instructions, setInstructions] = useState('Please call before arrival. Elevator is available.');

  const [paymentMethod, setPaymentMethod] = useState<'UPI / QR' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery'>('UPI / QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user.name || '');
  const [expiry, setExpiry] = useState('09/29');
  const [cvv, setCvv] = useState('•••');

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1f1c1b]">Your cart is empty</h2>
        <p className="text-xs text-gray-500">Please select a mandir from our catalog before checking out.</p>
        <button
          onClick={() => navigateTo('catalog')}
          className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl"
        >
          Explore Mandirs
        </button>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      streetAddress,
      apartment,
      city,
      state,
      pincode,
      isDefault: true,
      type: 'Home'
    };

    setTimeout(() => {
      const order = placeOrder(shippingAddress, paymentMethod);
      setPlacedOrder(order);
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  return (
    <div id="checkout-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Minimal Nav */}
      <div className="flex items-center justify-between pb-6 border-b border-[#eae5e2]">
        <button
          onClick={() => navigateTo('cart')}
          className="text-xs font-semibold text-[#7b581e] hover:text-[#570000] flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </button>

        <div className="text-center flex flex-col items-center">
          <BrandLogo config={brandConfig} variant="compact" theme="light" align="center" onClick={() => navigateTo('home')} />
          <span className="text-[10px] tracking-widest block text-stone-500 uppercase mt-0.5">Secure White-Glove Checkout</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL</span>
        </div>
      </div>

      {placedOrder ? (
        /* Order Success Screen */
        <div id="order-success-card" className="bg-white rounded-3xl border border-[#eae5e2] p-8 sm:p-12 max-w-3xl mx-auto text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#7b581e]">
              Auspicious Blessings
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#1f1c1b]">
              Your Mandir Order is Confirmed!
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              We have received your order for white-glove handcrafted temple delivery. Our master woodcarver has begun preparing the seasoned timber.
            </p>
          </div>

          {/* Receipt Details */}
          <div className="p-6 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] text-left text-xs space-y-3">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#eae5e2]">
              <div>
                <span className="text-gray-500 block">Order Number:</span>
                <span className="font-mono font-bold text-[#570000] text-sm">{placedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Tracking ID:</span>
                <span className="font-mono font-bold text-gray-800">{placedOrder.trackingNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#eae5e2]">
              <div>
                <span className="text-gray-500 block">Estimated White-Glove Delivery:</span>
                <span className="font-bold text-gray-900">{placedOrder.estimatedDelivery}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Payment Method:</span>
                <span className="font-bold text-gray-900">{placedOrder.paymentMethod}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">Delivering to:</span>
              <p className="font-semibold text-gray-800">
                {placedOrder.shippingAddress.fullName}, {placedOrder.shippingAddress.streetAddress}, {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.pincode}
              </p>
            </div>

            <div className="pt-2 border-t border-[#eae5e2] flex justify-between items-center text-sm font-bold">
              <span>Total Paid:</span>
              <span className="text-[#570000] font-serif text-lg">{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo('account')}
              className="px-8 py-3.5 rounded-xl bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold shadow-lg"
            >
              Track Order & View Invoices
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="px-8 py-3.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Forms */
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Details */}
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#eae5e2]">
                <span className="w-6 h-6 rounded-full bg-[#570000] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Delivery & Room Installation Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Recipient Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number (For Delivery Coordination)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email (For Order Updates & Vastu Certificate)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">House / Flat No., Building & Street Address</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Apartment / Landmark</label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={e => setApartment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Special Room Placement & Elevator Notes</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#eae5e2]">
                <span className="w-6 h-6 rounded-full bg-[#570000] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Select Payment Method</h3>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'UPI / QR', label: 'UPI / QR Code', icon: <QrCode className="w-4 h-4" /> },
                  { id: 'Credit/Debit Card', label: 'Cards', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'NetBanking', label: 'NetBanking', icon: <Building2 className="w-4 h-4" /> },
                  { id: 'Cash on Delivery', label: 'Pay on Setup', icon: <Truck className="w-4 h-4" /> },
                ].map(m => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all ${
                      paymentMethod === m.id
                        ? 'border-[#570000] bg-[#570000] text-white shadow-md'
                        : 'border-[#eae5e2] bg-[#fbf9f8] text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Payment Details Body */}
              {paymentMethod === 'UPI / QR' && (
                <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] flex flex-col sm:flex-row items-center gap-6">
                  {/* Simulated Dynamic QR Code */}
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-gray-300 shadow-sm flex flex-col items-center justify-center shrink-0">
                    <QrCode className="w-24 h-24 text-[#570000]" />
                    <span className="text-[9px] font-bold text-gray-500">Scan & Pay</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p className="font-bold text-[#1f1c1b]">Scan QR using any UPI App</p>
                    <p className="text-gray-500">Supports Google Pay, PhonePe, Paytm, BHIM, and all major bank UPI apps.</p>
                    <p className="font-mono text-[11px] text-[#570000] font-bold">aksharmandir@icici</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'Credit/Debit Card' && (
                <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Cash on Delivery' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Pay After White-Glove Installation</p>
                  <p className="text-[11px] text-amber-800">
                    Inspect the seasoned hardwood quality and pooja room assembly before completing payment via Cash or UPI at your doorstep.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b] pb-3 border-b border-[#eae5e2]">
                Order Items ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-[#eae5e2]/60 last:border-none">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-14 h-14 object-cover rounded-xl border border-[#eae5e2]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1f1c1b] truncate">{item.product.title}</p>
                      <p className="text-[11px] text-gray-500">Qty: {item.quantity} • {item.selectedFinish}</p>
                    </div>
                    <span className="text-xs font-bold text-[#570000]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs text-gray-700 border-t border-[#eae5e2] pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(cartSubtotal)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>White-Glove Shipping & Assembly</span>
                  <span className="font-bold text-emerald-700">Complimentary</span>
                </div>

                <div className="pt-3 border-t border-[#eae5e2] flex justify-between items-baseline">
                  <span className="font-bold text-base text-[#1f1c1b]">Total Payable:</span>
                  <span className="text-2xl font-serif font-bold text-[#570000]">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                id="place-order-submit-btn"
                className="w-full py-4 px-6 rounded-2xl bg-[#570000] hover:bg-[#800000] disabled:bg-gray-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-[#570000]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <span>Securing Your Mandir Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#fdcc87]" />
                    <span>Place Secure Order • {formatPrice(cartTotal)}</span>
                  </>
                )}
              </button>

              <div className="space-y-2 text-[11px] text-gray-500 pt-2 border-t border-[#eae5e2]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>5-Year Structural & Termite Warranty included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#570000]" />
                  <span>Doorstep White-Glove installation by certified carpenters</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
