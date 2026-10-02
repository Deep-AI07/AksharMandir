import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { printInvoice, downloadInvoicePdf } from '../../utils/invoiceUtils';
import { Address, Order } from '../../types';
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
  Printer,
  FileText,
  ShoppingBag,
  AlertCircle,
  Home,
  ChevronRight
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    user, 
    addresses,
    cartSubtotal, 
    cartDiscount, 
    cartTotal, 
    appliedCoupon, 
    placeOrder, 
    formatPrice,
    showToast,
    brandConfig,
    isAuthenticated
  } = useApp();

  const navigate = useNavigate();

  // Selected saved address or manual input
  const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : 'new');

  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [streetAddress, setStreetAddress] = useState(defaultAddr?.streetAddress || '');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '');
  const [instructions, setInstructions] = useState('');

  // Payment State: Exactly UPI, QR, CARD, COD
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'QR' | 'CARD' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(fullName || user?.name || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sync user profile when user logs in or loads
  React.useEffect(() => {
    if (user) {
      setFullName(prev => prev || user.name || '');
      setPhone(prev => prev || user.phone || '');
      setEmail(prev => prev || user.email || '');
      setCardHolder(prev => prev || user.name || '');
    }
  }, [user]);

  // Sync default address when addresses are loaded
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === 'new') {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      if (def) {
        setSelectedAddressId(def.id);
        setFullName(def.fullName);
        setPhone(def.phone);
        setStreetAddress(def.streetAddress);
        setApartment(def.apartment || '');
        setCity(def.city);
        setState(def.state);
        setPincode(def.pincode);
      }
    }
  }, [addresses, selectedAddressId]);

  // Address selector switch
  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setFullName(user?.name || '');
      setPhone(user?.phone || '');
      setStreetAddress('');
      setApartment('');
      setCity('');
      setState('');
      setPincode('');
    } else {
      const addr = addresses.find(a => a.id === id);
      if (addr) {
        setFullName(addr.fullName);
        setPhone(addr.phone);
        setStreetAddress(addr.streetAddress);
        setApartment(addr.apartment || '');
        setCity(addr.city);
        setState(addr.state);
        setPincode(addr.pincode);
      }
    }
  };

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1f1c1b]">Your cart is empty</h2>
        <p className="text-xs text-gray-500">Please select a mandir from our catalog before checking out.</p>
        <Link
          to="/mandirs"
          className="inline-block px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl"
        >
          Explore Mandirs
        </Link>
      </div>
    );
  }

  // Authentication Gate for Placing Sacred Orders
  if (!isAuthenticated && !placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#eae5e2] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#570000]/10 text-[#570000] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#570000]">Secure Checkout</span>
            <h2 className="text-2xl font-serif font-bold text-[#1f1c1b]">
              Sign In to Complete Your Order
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please sign in or create an account to link your 5-year structural warranty certificate, official tax invoice, and live mandir delivery tracking.
            </p>
          </div>

          {/* Cart summary badge */}
          <div className="p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#570000]" />
              <span className="font-semibold text-gray-700">{cart.length} Mandir(s) in Cart</span>
            </div>
            <span className="font-serif font-bold text-sm text-[#570000]">{formatPrice(cartTotal)}</span>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Sign In & Continue Checkout</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>

            <Link
              to="/register?redirect=/checkout"
              className="w-full py-3 rounded-xl border border-[#eae5e2] text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center justify-center transition-colors"
            >
              <span>Create New Customer Account</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#eae5e2] flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#7b581e]" />
              <span>White-Glove Delivery</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim() || !streetAddress.trim() || !city.trim() || !pincode.trim()) {
      showToast('Please complete all delivery address fields.', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit contact phone number.', 'error');
      return;
    }

    if (pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit postal pincode.', 'error');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      showToast('Please enter your UPI ID (e.g. mobile@upi).', 'error');
      return;
    }

    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        showToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (!expiry.trim() || !expiry.includes('/')) {
        showToast('Please enter card expiry date in MM/YY format.', 'error');
        return;
      }
      if (cvv.trim().length < 3) {
        showToast('Please enter a valid 3-digit CVV.', 'error');
        return;
      }
    }

    setIsProcessing(true);

    const shippingAddress: Address = {
      id: selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      apartment: apartment ? apartment.trim() : null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: true,
      type: 'Home'
    };

    try {
      const order = await placeOrder(shippingAddress, paymentMethod, instructions, {
        email: email.trim(),
        name: fullName.trim(),
        phone: phone.trim()
      });
      setPlacedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Payment or order failed. Please verify your details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Success Screen
  if (placedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#570000]">Order Confirmed</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1f1c1b]">
            Dhanyawad! Your Mandir Order is Confirmed.
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            Order Reference: <strong className="font-mono text-[#570000]">{placedOrder.orderNumber}</strong>. A confirmation email has been sent to <strong>{placedOrder.customerEmail}</strong>.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[#eae5e2] text-xs">
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Payment Method</span>
              <strong className="text-[#1f1c1b]">{placedOrder.paymentMethod}</strong>
              <span className={`inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                placedOrder.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {placedOrder.paymentStatus}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Order Status</span>
              <strong className="text-[#570000]">{placedOrder.orderStatus}</strong>
              <p className="text-[11px] text-gray-500">Master Artisan Seasoning</p>
            </div>

            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Delivery Status</span>
              <strong className="text-gray-700">{placedOrder.deliveryStatus.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#1f1c1b]">Ordered Mandirs</h3>
            <div className="divide-y divide-[#eae5e2]">
              {placedOrder.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={getProductImageUrl(item.image || item)}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-12 h-12 object-cover rounded-xl border border-[#eae5e2]"
                    />
                    <div>
                      <strong className="text-[#1f1c1b] block">{item.title}</strong>
                      <span className="text-gray-500">Finish: {item.finish} • Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#570000]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-[#eae5e2] flex justify-between items-center text-sm">
            <span className="font-bold text-gray-700">Total Amount Paid:</span>
            <span className="text-2xl font-serif font-bold text-[#570000]">{formatPrice(placedOrder.total)}</span>
          </div>
        </div>

        {/* Invoice & Next Actions */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#570000]" />
              <span>View Tax Invoice</span>
            </button>

            <button
              onClick={() => printInvoice(placedOrder, brandConfig)}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#570000]" />
              <span>Print Invoice (1 Page)</span>
            </button>

            <button
              onClick={async () => {
                try {
                  setDownloading(true);
                  await downloadInvoicePdf(placedOrder, brandConfig);
                  showToast('Invoice PDF downloaded successfully.', 'success');
                } catch (err) {
                  showToast('Failed to download invoice PDF.', 'error');
                } finally {
                  setDownloading(false);
                }
              }}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#7b0000] text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generating...' : 'Download Invoice PDF'}</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/account/orders"
              className="px-5 py-2.5 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000] shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>View in My Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/mandirs"
              className="px-5 py-2.5 rounded-xl border border-[#eae5e2] bg-white text-gray-700 hover:text-[#570000] hover:border-[#570000] text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#570000]" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-[#eae5e2] bg-white text-gray-700 hover:text-[#570000] hover:border-[#570000] text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>

        {/* Invoice Modal */}
        {invoiceModalOpen && (
          <InvoiceModal
            order={placedOrder}
            isOpen={invoiceModalOpen}
            onClose={() => setInvoiceModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div id="checkout-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/cart" className="hover:text-[#570000]">Cart</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold">Secure Checkout</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/cart"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </Link>
          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Shipping Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Address */}
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#eae5e2] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#1f1c1b] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#570000]" />
                <span>1. Delivery Destination</span>
              </h2>
            </div>

            {/* Saved Address Selector */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500">Select Saved Delivery Address</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-xs space-y-1 ${
                        selectedAddressId === addr.id
                          ? 'border-[#570000] bg-[#570000]/5 ring-1 ring-[#570000]'
                          : 'border-[#eae5e2] hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <strong className="text-[#1f1c1b]">{addr.fullName}</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{addr.type}</span>
                      </div>
                      <p className="text-gray-500 truncate">{addr.streetAddress}, {addr.city}</p>
                      <p className="text-gray-400 font-mono text-[11px]">{addr.phone}</p>
                    </div>
                  ))}
                  <div
                    onClick={() => handleAddressSelect('new')}
                    className={`p-3.5 rounded-2xl border border-dashed cursor-pointer transition-all text-xs flex items-center justify-center font-semibold ${
                      selectedAddressId === 'new'
                        ? 'border-[#570000] bg-[#570000]/5 text-[#570000]'
                        : 'border-[#eae5e2] text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    + Enter New Address
                  </div>
                </div>
              </div>
            )}

            {/* Address Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Email for Order Updates & Invoice</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat No, Building, Street Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Apartment / Landmark (Optional)</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Methods (Exact 4 methods: UPI, QR, CARD, COD) */}
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#eae5e2] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#1f1c1b] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#570000]" />
                <span>2. Payment Method</span>
              </h2>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-[#570000] bg-[#570000]/5 text-[#570000] ring-2 ring-[#570000]/20'
                    : 'border-[#eae5e2] text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-1.5 text-[#570000]" />
                <span className="text-xs font-bold block">1. UPI</span>
                <span className="text-[10px] text-gray-400">GPay, PhonePe, Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QR')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'QR'
                    ? 'border-[#570000] bg-[#570000]/5 text-[#570000] ring-2 ring-[#570000]/20'
                    : 'border-[#eae5e2] text-gray-700 hover:border-gray-300'
                }`}
              >
                <QrCode className="w-6 h-6 mx-auto mb-1.5 text-[#570000]" />
                <span className="text-xs font-bold block">2. QR CODE</span>
                <span className="text-[10px] text-gray-400">Scan & Pay Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-[#570000] bg-[#570000]/5 text-[#570000] ring-2 ring-[#570000]/20'
                    : 'border-[#eae5e2] text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-1.5 text-[#570000]" />
                <span className="text-xs font-bold block">3. CARD</span>
                <span className="text-[10px] text-gray-400">Debit / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#570000] bg-[#570000]/5 text-[#570000] ring-2 ring-[#570000]/20'
                    : 'border-[#eae5e2] text-gray-700 hover:border-gray-300'
                }`}
              >
                <Truck className="w-6 h-6 mx-auto mb-1.5 text-[#570000]" />
                <span className="text-xs font-bold block">4. CASH ON DELIVERY</span>
                <span className="text-[10px] text-gray-400">Pay on Temple Setup</span>
              </button>
            </div>

            {/* Dynamic Payment Method Fields */}
            <div className="p-5 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] space-y-4">
              {paymentMethod === 'UPI' && (
                <div className="space-y-3 max-w-md">
                  <label className="text-xs uppercase font-bold text-gray-600 block">Enter UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or name@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                  <p className="text-[11px] text-gray-500">You will receive an instant payment request on your UPI application.</p>
                </div>
              )}

              {paymentMethod === 'QR' && (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  {/* Sacred Dynamic QR Graphic */}
                  <div className="w-36 h-36 bg-white p-2.5 rounded-2xl border-2 border-[#570000] shadow-md flex flex-col items-center justify-center shrink-0">
                    <QrCode className="w-24 h-24 text-[#570000]" />
                    <span className="text-[9px] font-bold text-gray-500 mt-1">AKSHAR MANDIR PAY</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <h4 className="font-serif font-bold text-sm text-[#1f1c1b]">Scan via Any Indian UPI App</h4>
                    <p>Open BHIM, Google Pay, PhonePe, or Paytm and scan the payment QR code above.</p>
                    <p className="text-emerald-700 font-semibold text-[11px]">✓ Instant automated order validation active</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs uppercase font-bold text-gray-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-xs font-mono font-semibold focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs uppercase font-bold text-gray-600 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-xs font-mono font-semibold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-gray-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eae5e2] text-xs font-mono font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2 text-[#570000] font-bold">
                    <Truck className="w-4 h-4" />
                    <span>Cash On Delivery Policy</span>
                  </div>
                  <p>• Your order will be created with status <strong>CONFIRMED</strong> and payment status <strong>PENDING</strong>.</p>
                  <p>• Total amount of <strong>{formatPrice(cartTotal)}</strong> will be collected in cash/UPI upon white-glove mandir installation.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-xl space-y-6">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b] pb-3 border-b border-[#eae5e2]">
              Order Review ({cart.length} Mandirs)
            </h3>

            {/* Cart Items List */}
            <div className="divide-y divide-[#eae5e2] max-h-56 overflow-y-auto space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getProductImageUrl(item.product)}
                      alt={item.product?.title || 'Mandir'}
                      onError={handleImageError}
                      className="w-10 h-10 object-cover rounded-lg border border-[#eae5e2]"
                    />
                    <div>
                      <strong className="text-[#1f1c1b] block truncate max-w-[130px]">{item.product?.title}</strong>
                      <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-[#570000]">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-3 border-t border-[#eae5e2]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong className="text-[#1f1c1b]">{formatPrice(cartSubtotal)}</strong>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>- {formatPrice(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-emerald-700 font-bold uppercase text-[10px]">Free Pan-India</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="pt-4 border-t border-[#eae5e2] flex justify-between items-baseline">
              <span className="text-xs uppercase font-bold text-gray-500">Final Total</span>
              <span className="text-2xl font-serif font-bold text-[#570000]">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold shadow-xl shadow-[#570000]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Place Order ({paymentMethod})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
