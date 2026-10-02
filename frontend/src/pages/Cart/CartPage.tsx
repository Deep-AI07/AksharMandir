import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { 
  ShoppingBag, 
  Trash2, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  X, 
  Lock, 
  Compass,
  AlertCircle,
  Home,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    toggleWishlist, 
    cartSubtotal, 
    cartDiscount, 
    cartTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    formatPrice 
  } = useApp();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setCouponInput('');
    setApplyingCoupon(false);
  };

  if (cart.length === 0) {
    return (
      <div id="cart-page-empty" className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#570000]/10 text-[#570000] flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-[#1f1c1b]">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            You have not added any handcrafted mandirs to your cart yet. Explore our curated collections or configure a bespoke mandir.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/mandirs"
            className="px-6 py-3.5 rounded-xl bg-[#570000] text-white text-xs font-bold shadow-lg hover:bg-[#800000] transition-all flex items-center gap-2"
          >
            <span>Explore Handcrafted Mandirs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/custom-mandir"
            className="px-6 py-3.5 rounded-xl bg-[#fdcc87] text-[#3e0000] text-xs font-bold shadow-lg hover:bg-[#ffe3b3] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Bespoke Mandir</span>
          </Link>
          <Link
            to="/"
            className="px-6 py-3.5 rounded-xl border border-[#eae5e2] bg-white text-gray-700 hover:text-[#570000] text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumbs & Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/mandirs" className="hover:text-[#570000]">Mandirs</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold">Shopping Cart ({cart.length})</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/mandirs"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
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

      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">Pooja Ghar Cart</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1f1c1b] mt-1">
          Review Your Mandir Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your handcrafted temple selections before secure white-glove dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm divide-y divide-[#eae5e2]">
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${item.selectedFinish}-${idx}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-center">
                {/* Image */}
                <img
                  src={getProductImageUrl(item.product)}
                  alt={item.product?.title || 'Mandir'}
                  onError={handleImageError}
                  onClick={() => navigate(`/product/${item.product?.slug}`)}
                  className="w-full sm:w-32 h-28 object-cover rounded-2xl border border-[#eae5e2] cursor-pointer"
                />

                {/* Details */}
                <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#7b581e]">
                    {typeof item.product?.category === 'object' ? item.product.category.name : (item.product?.category || item.product?.material)}
                  </span>
                  <h3
                    onClick={() => navigate(`/product/${item.product?.slug}`)}
                    className="font-serif font-bold text-base text-[#1f1c1b] hover:text-[#570000] cursor-pointer"
                  >
                    {item.product?.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Finish: <strong className="text-gray-800">{item.selectedFinish}</strong> • SKU: {item.product?.sku}
                  </p>

                  {/* Stock check indicator */}
                  {item.product?.stockQuantity < item.quantity && (
                    <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Only {item.product.stockQuantity} ready in stock (balance will be crafted)</span>
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#eae5e2] rounded-xl bg-[#fbf9f8] p-1">
                    <button
                      onClick={() => updateCartQuantity(item.id || item.productId, Math.max(1, item.quantity - 1), item.selectedFinish)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#1f1c1b]">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id || item.productId, item.quantity + 1, item.selectedFinish)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="font-serif font-bold text-base text-[#570000]">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id || item.productId, item.selectedFinish)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Value Assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#570000]" />
              <span>Complimentary White-Glove Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#570000]" />
              <span>5-Year Structural Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#570000]" />
              <span>256-Bit Encrypted Payments</span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Checkout */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-xl space-y-6">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b] pb-3 border-b border-[#eae5e2]">
              Order Summary
            </h3>

            {/* Subtotals */}
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Mandir Items Subtotal:</span>
                <strong className="text-[#1f1c1b]">{formatPrice(cartSubtotal)}</strong>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span>- {formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Pan-India Temple Delivery:</span>
                <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="pt-3 border-t border-[#eae5e2]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                  </div>
                  <button onClick={removeCoupon} className="p-1 hover:bg-emerald-100 rounded-md">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. DIVINE10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] uppercase focus:outline-hidden focus:border-[#570000]"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-[#570000] text-white text-xs font-bold rounded-xl hover:bg-[#800000] transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-[#eae5e2] flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500">Final Total</span>
                <p className="text-[10px] text-gray-400">All taxes included</p>
              </div>
              <span className="text-2xl font-serif font-bold text-[#570000]">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full py-4 rounded-xl bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
