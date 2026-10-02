import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Check
} from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice 
  } = useApp();

  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedFinish, setSelectedFinish] = useState('');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isSaved = isInWishlist(product.id);
  const activeFinish = selectedFinish || product.colorFinish || (product.availableFinishes && product.availableFinishes[0]) || 'Natural Teak Polish';

  const handleAddToCart = () => {
    addToCart(product, quantity, activeFinish);
    setQuickViewProduct(null);
  };

  const handleViewFullDetails = () => {
    setQuickViewProduct(null);
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative border border-[#eae5e2] animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-500 hover:text-gray-900 shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="aspect-4/3 sm:aspect-auto h-64 sm:h-full bg-[#f6f3f2] relative">
            <img
              src={getProductImageUrl(product, 0)}
              alt={product.title}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7b581e]">
                {typeof product.category === 'object' ? product.category.name : (product.category || product.material)}
              </span>

              <h3 className="font-serif font-bold text-lg text-[#1f1c1b] leading-tight">
                {product.title}
              </h3>

              <div className="flex items-center gap-1 text-[#d4af37]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span className="text-gray-400">({product.reviewsCount || 12} reviews)</span>
              </div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl font-serif font-bold text-[#570000]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 line-clamp-3 text-[11px] leading-relaxed">
                {product.shortDescription}
              </p>

              <div className="pt-2 text-[11px] space-y-1 text-gray-600">
                <p><strong>Dimensions:</strong> {product.dimensions}</p>
                <p><strong>Mounting:</strong> {product.mountingType}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-[#eae5e2]">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-[#570000] text-white font-bold hover:bg-[#800000] shadow-md flex items-center justify-center gap-1.5 disabled:bg-gray-300"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isSaved ? 'bg-[#570000] text-white border-[#570000]' : 'border-gray-200 text-gray-500 hover:text-[#570000]'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button
                onClick={handleViewFullDetails}
                className="w-full py-2 text-center text-[#570000] font-semibold hover:underline text-[11px] flex items-center justify-center gap-1"
              >
                <span>View Complete Mandir Specifications</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
