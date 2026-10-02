import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Compass 
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
    formatPrice, 
    navigateTo 
  } = useApp();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div id="cart-page-empty" className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#570000]/10 text-[#570000] flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-[#1f1c1b]">Your Pooja Ghar Cart is Empty</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            You have not added any handcrafted mandirs to your cart yet. Explore our curated collections or configure a bespoke mandir.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => navigateTo('catalog')}
            className="px-8 py-3.5 rounded-xl bg-[#570000] text-white text-xs font-bold shadow-lg hover:bg-[#800000] transition-all flex items-center gap-2"
          >
            <span>Explore Handcrafted Mandirs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo('custom')}
            className="px-8 py-3.5 rounded-xl bg-[#fdcc87] text-[#3e0000] text-xs font-bold shadow-lg hover:bg-[#ffe3b3] transition-all"
          >
            Create Bespoke Mandir ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
              <div key={`${item.product.id}-${item.selectedFinish}-${idx}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-center">
                {/* Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  onClick={() => navigateTo('product', { productId: item.product.id })}
                  className="w-full sm:w-32 h-28 object-cover rounded-2xl border border-[#eae5e2] cursor-pointer"
                />

                {/* Details */}
                <div className="flex-1 space-y-1.5 text-center sm:text-left w-full sm:w-auto">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#570000]/10 text-[#570000] px-2 py-0.5 rounded">
                      {item.product.category}
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                      Finish: {item.selectedFinish}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigateTo('product', { productId: item.product.id })}
                    className="font-serif font-bold text-base text-[#1f1c1b] hover:text-[#570000] cursor-pointer"
                  >
                    {item.product.title}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {item.product.material} • {item.product.dimensions}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                    <button
                      onClick={() => toggleWishlist(item.product.id)}
                      className="text-xs text-[#7b581e] hover:text-[#570000] flex items-center gap-1 font-medium hover:underline"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Save to Wishlist</span>
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedFinish)}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  {/* Quantity Modifier */}
                  <div className="flex items-center border border-[#eae5e2] rounded-xl bg-[#fbf9f8]">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity - 1)}
                      className="px-2.5 py-1 text-sm font-bold text-gray-600 hover:text-black"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity + 1)}
                      className="px-2.5 py-1 text-sm font-bold text-gray-600 hover:text-black"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-base font-bold text-[#570000] block">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-gray-400">
                        ({formatPrice(item.product.price)} each)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Application */}
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Tag className="w-4 h-4 text-[#570000]" />
              <span>Apply Promo Code</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-900">
                    Promo "{appliedCoupon.code}" Active ({appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}% OFF` : `₹${appliedCoupon.discountFixed} OFF`})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Enter code e.g. DIVINE10, FESTIVE15"
                  className="flex-1 text-xs p-3 rounded-xl border border-[#eae5e2] bg-[#fbf9f8] uppercase font-bold focus:outline-none focus:border-[#570000]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#570000] hover:bg-[#800000] text-white font-bold text-xs shadow"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-500">
              <span>Available Coupons:</span>
              <button onClick={() => applyCoupon('DIVINE10')} className="font-mono text-[#570000] underline font-bold">DIVINE10</button>
              <span>•</span>
              <button onClick={() => applyCoupon('FESTIVE15')} className="font-mono text-[#570000] underline font-bold">FESTIVE15</button>
              <span>•</span>
              <button onClick={() => applyCoupon('VASTU500')} className="font-mono text-[#570000] underline font-bold">VASTU500</button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b] pb-4 border-b border-[#eae5e2]">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-bold text-gray-900">{formatPrice(cartSubtotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Pan-India Shipping</span>
                <span className="font-bold text-emerald-700">Complimentary (₹0)</span>
              </div>

              <div className="flex justify-between">
                <span>Vastu Inspection Certificate</span>
                <span className="font-bold text-emerald-700">Included Free</span>
              </div>

              <div className="pt-3 border-t border-[#eae5e2] flex justify-between items-baseline text-base">
                <span className="font-bold text-[#1f1c1b]">Grand Total:</span>
                <span className="text-2xl font-serif font-bold text-[#570000]">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3 pt-2">
              <button
                id="proceed-to-checkout-btn"
                onClick={() => navigateTo('checkout')}
                className="w-full py-4 px-6 rounded-2xl bg-[#570000] hover:bg-[#800000] text-white font-bold text-xs tracking-wide shadow-xl shadow-[#570000]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Secure Checkout • {formatPrice(cartTotal)}</span>
              </button>

              <button
                onClick={() => navigateTo('catalog')}
                className="w-full py-2.5 text-center text-xs font-semibold text-[#7b581e] hover:text-[#570000] hover:underline"
              >
                ← Continue Shopping Mandirs
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-[#eae5e2] space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#570000]" />
                <span>Wooden Crate Transit Insurance Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
