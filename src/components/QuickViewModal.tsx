import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FinishType } from '../types';
import { X, Star, ShoppingBag, Heart, Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    navigateTo 
  } = useApp();

  const [selectedFinish, setSelectedFinish] = useState<FinishType | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const currentFinish = selectedFinish || quickViewProduct.finish;
  const isWishlisted = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, currentFinish);
    setQuickViewProduct(null);
  };

  const handleViewFullDetails = () => {
    navigateTo('product', { productId: quickViewProduct.id });
    setQuickViewProduct(null);
  };

  return (
    <div 
      id="quick-view-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setQuickViewProduct(null)}
    >
      <div 
        id="quick-view-modal-content"
        className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-[#eae5e2] overflow-hidden relative animate-in fade-in zoom-in-95 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md border border-[#eae5e2] text-gray-700 hover:text-black flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery */}
          <div className="p-6 bg-[#fbf9f8] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#eae5e2]">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white shadow-sm border border-[#eae5e2]">
              <img
                src={quickViewProduct.images[selectedImageIdx] || quickViewProduct.images[0]}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <span className="absolute top-3 left-3 bg-[#570000] text-[#fdcc87] text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                {quickViewProduct.category}
              </span>
            </div>

            {/* Thumbnails */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-[#570000] ring-2 ring-[#570000]/20' : 'border-[#eae5e2] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold ml-1 text-[#1f1c1b]">{quickViewProduct.rating}</span>
                </div>
                <span className="text-xs text-gray-400">({quickViewProduct.reviewsCount} reviews)</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-mono">SKU: {quickViewProduct.sku}</span>
              </div>

              <h3 className="text-xl font-bold font-serif text-[#1f1c1b]">{quickViewProduct.title}</h3>
              <p className="text-xs text-[#7b581e] font-medium mt-0.5">{quickViewProduct.material} • {quickViewProduct.mounting}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold text-[#570000]">{formatPrice(quickViewProduct.price)}</span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">{formatPrice(quickViewProduct.originalPrice)}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Save {quickViewProduct.discountPercentage || 10}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                {quickViewProduct.shortDescription}
              </p>

              {/* Bento Specs Mini */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 rounded-lg bg-[#f6f3f2] border border-[#eae5e2]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Dimensions</span>
                  <span className="font-semibold text-[#1f1c1b]">{quickViewProduct.dimensions}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#f6f3f2] border border-[#eae5e2]">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Warranty</span>
                  <span className="font-semibold text-[#1f1c1b]">{quickViewProduct.warranty}</span>
                </div>
              </div>

              {/* Finish Selector */}
              <div className="mt-4">
                <span className="text-xs font-bold text-[#1f1c1b] block mb-1.5">
                  Select Finish Polish: <span className="text-[#7b581e] font-medium">{currentFinish}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.availableFinishes.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFinish(f)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                        currentFinish === f
                          ? 'border-[#570000] bg-[#570000] text-white shadow-sm'
                          : 'border-[#eae5e2] bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-[#eae5e2] rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-sm text-gray-600 hover:text-black font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-sm text-gray-600 hover:text-black font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#570000] hover:bg-[#800000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#570000]/15 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart • {formatPrice(quickViewProduct.price * quantity)}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                    isWishlisted 
                      ? 'border-[#570000] bg-[#570000]/10 text-[#570000]' 
                      : 'border-[#eae5e2] bg-white text-gray-600 hover:text-[#570000]'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#570000]' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleViewFullDetails}
                className="w-full py-2 text-xs font-semibold text-[#7b581e] hover:text-[#570000] flex items-center justify-center gap-1 hover:underline"
              >
                <span>View Full Architectural Specifications & Reviews</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
