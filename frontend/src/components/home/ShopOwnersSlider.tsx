import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopOwner } from '../../types';
import { DEFAULT_SHOP_OWNERS } from '../../config/branding';
import { handleImageError } from '../../utils/imageUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Award, 
  UserCheck,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface ShopOwnersSliderProps {
  className?: string;
  autoPlayInterval?: number;
}

export const ShopOwnersSlider: React.FC<ShopOwnersSliderProps> = ({
  className = '',
  autoPlayInterval = 4500,
}) => {
  const { brandConfig } = useApp();
  const owners: ShopOwner[] = (brandConfig.owners && brandConfig.owners.length > 0)
    ? brandConfig.owners
    : DEFAULT_SHOP_OWNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Safely constrain index if owners array changes
  const activeIndex = currentIndex >= owners.length ? 0 : currentIndex;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % owners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + owners.length) % owners.length);
  };

  // Continuous auto-sliding
  useEffect(() => {
    if (isPaused || owners.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, isPaused, owners.length, autoPlayInterval]);

  const currentOwner = owners[activeIndex] || owners[0];

  return (
    <div
      id="shop-owners-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative mx-auto max-w-md lg:max-w-none select-none ${className}`}
    >
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#fdcc87]/40 shadow-2xl shadow-black/60 bg-gradient-to-b from-[#2a0000] via-[#1f0505] to-[#120000] text-white flex flex-col">
        
        {/* Top Header Bar - Shows ONLY FOUNDER OWNER & CO-OWNER (Admin Configurable) */}
        <div className="px-5 py-3 border-b border-[#fdcc87]/25 flex items-center justify-center bg-gradient-to-r from-black/80 via-black/90 to-black/80 backdrop-blur-md z-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#fdcc87]" />
            <span className="text-xs sm:text-sm font-serif font-bold uppercase tracking-widest text-[#fdcc87]">
              {brandConfig.ownersSectionTitle || 'FOUNDER OWNER & CO-OWNER'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#fdcc87]" />
          </div>
        </div>

        {/* Clean Portrait Image Container (Zero Overlap with details below) */}
        <div className="relative w-full h-[340px] sm:h-[370px] overflow-hidden bg-[#160202]">
          {/* Animated Carousel Track */}
          <div 
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {owners.map((owner, idx) => (
              <div key={owner.id || idx} className="w-full h-full shrink-0 relative">
                <img
                  src={owner.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                  alt={owner.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f0505] via-transparent to-transparent opacity-80" />
              </div>
            ))}
          </div>

          {/* Navigation Arrow Buttons */}
          {owners.length > 1 && (
            <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="pointer-events-auto p-2.5 rounded-full bg-black/60 hover:bg-[#570000] text-white/90 hover:text-[#fdcc87] backdrop-blur-md border border-white/20 transition-all transform hover:scale-110 shadow-xl"
                aria-label="Previous Owner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="pointer-events-auto p-2.5 rounded-full bg-black/60 hover:bg-[#570000] text-white/90 hover:text-[#fdcc87] backdrop-blur-md border border-white/20 transition-all transform hover:scale-110 shadow-xl"
                aria-label="Next Owner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dedicated Bottom Details Panel (Displays ONLY Name, Post/Role, Experience) */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1f0505] to-[#120000] border-t border-[#fdcc87]/25 space-y-3 z-10">
          <div>
            {/* 1. Name */}
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#fbf9f8] tracking-wide flex items-center gap-2">
              <span>{currentOwner.name}</span>
            </h3>

            {/* 2. Post / Role */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#fdcc87] mt-0.5">
              <Briefcase className="w-3.5 h-3.5 shrink-0 text-[#d4af37]" />
              <span>{currentOwner.role}</span>
            </div>

            {/* 3. Experience */}
            <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium mt-1">
              <Award className="w-3.5 h-3.5 shrink-0 text-[#fdcc87]" />
              <span>{currentOwner.experience || 'Master Mandir Artisan'}</span>
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {owners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? 'w-7 bg-[#fdcc87]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Switch to Owner ${idx + 1}`}
                />
              ))}
            </div>

            <span className="text-[11px] text-[#fdcc87] font-bold tracking-wider uppercase">
              Vedic Sthapati
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
