import React, { useState } from 'react';
import { BrandConfig } from '../../config/branding';

interface BrandLogoProps {
  config?: Partial<BrandConfig>;
  variant?: 'header' | 'footer' | 'hero' | 'admin' | 'invoice' | 'compact';
  theme?: 'light' | 'dark' | 'gold';
  onClick?: () => void;
  className?: string;
  showTagline?: boolean;
  align?: 'left' | 'center';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  config,
  variant = 'header',
  theme = 'light',
  onClick,
  className = '',
  showTagline = true,
  align = 'left'
}) => {
  const [imageError, setImageError] = useState(false);

  const brandName = config?.brandName || 'AKSHAR MANDIR';
  const logoUrl = config?.logoUrl || '/images/akshar_mandir_logo.jpg';
  const logoAltText = config?.logoAltText || `${brandName} Logo`;

  // Determine size classes based on variant
  const isHeader = variant === 'header';
  const isFooter = variant === 'footer';
  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';
  const isInvoice = variant === 'invoice';
  const isAdmin = variant === 'admin';

  // Text color based on theme
  const titleColor = theme === 'dark' 
    ? 'text-[#fdcc87]' 
    : theme === 'gold' 
      ? 'text-[#fdcc87]' 
      : 'text-[#570000]';

  const logoSize = isHero 
    ? 'w-16 h-16 sm:w-20 sm:h-20' 
    : isFooter 
      ? 'w-12 h-12 lg:w-14 lg:h-14' 
      : isCompact 
        ? 'w-8 h-8' 
        : isAdmin
          ? 'w-10 h-10'
          : 'w-11 h-11 lg:w-12 lg:h-12';

  return (
    <div
      id={`brand-logo-${variant}`}
      onClick={onClick}
      className={`group flex items-center select-none transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${
        align === 'center' ? 'justify-center text-center' : 'justify-start text-left'
      } ${className}`}
    >
      <div className={`flex ${align === 'center' ? 'flex-col sm:flex-row' : 'flex-row'} items-center gap-3`}>
        {/* Sacred Temple Emblem Medallion */}
        <div className={`relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105 ${logoSize} ${
          theme === 'dark' 
            ? 'bg-[#fcf9f5] border-2 border-[#fdcc87] ring-2 ring-[#fdcc87]/30 shadow-[#570000]/40' 
            : 'bg-[#fcf9f5] border-2 border-[#d4af37]/60 ring-1 ring-[#570000]/10 shadow-xs'
        }`}>
          {logoUrl && !imageError ? (
            <img
              src={logoUrl}
              alt={logoAltText}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
          ) : (
            /* Sacred Gopuram & Kalash Temple Vector Emblem Fallback */
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full p-1.5 text-[#570000]"
            >
              <path d="M24 4L26.5 9.5H21.5L24 4Z" fill="#d4af37" />
              <circle cx="24" cy="4" r="1.5" fill="#f6e05e" />
              <path d="M17 10L24 6L31 10L29.5 16H18.5L17 10Z" fill="#d4af37" />
              <path d="M15 16.5H33L31 22H17L15 16.5Z" fill="#570000" />
              <path d="M13 22.5H35V39C35 40.1 34.1 41 33 41H15C13.9 41 13 40.1 13 39V22.5Z" fill="#3e0000" />
              <path d="M18 41V29C18 25.7 20.7 23 24 23C27.3 23 30 25.7 30 29V41H18Z" fill="#fdcc87" />
              <rect x="10" y="41" width="28" height="3" rx="1" fill="#d4af37" />
              <rect x="7" y="44" width="34" height="2" rx="0.5" fill="#fdcc87" />
            </svg>
          )}
        </div>

        {/* Brand Text Stack (Name) */}
        <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} justify-center`}>
          {/* Main Brand Name */}
          <span 
            className={`font-serif font-bold tracking-[0.06em] leading-tight transition-colors ${titleColor} ${
              isHero 
                ? 'text-2xl sm:text-3xl' 
                : isFooter 
                  ? 'text-2xl lg:text-3xl' 
                  : isCompact 
                    ? 'text-lg' 
                    : isInvoice
                      ? 'text-xl'
                      : 'text-xl sm:text-2xl lg:text-2xl'
            }`}
          >
            {brandName}
          </span>
        </div>
      </div>
    </div>
  );
};
