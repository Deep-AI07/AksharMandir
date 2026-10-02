import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award, 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Heart,
  ArrowRight,
  Check
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, showToast, brandConfig } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      showToast('Thank you for subscribing to our Sacred Heritage journal!', 'success');
      setEmail('');
    }
  };

  return (
    <footer id="main-footer" className="bg-[#1f1c1b] text-[#fbf9f8] border-t border-[#3e0000]">
      {/* Value Pillars Banner */}
      <div className="border-b border-white/10 py-10 bg-[#161413]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Solid Hardwood</h4>
                <p className="text-xs text-gray-400 mt-0.5">Ethically seasoned Sheesham & Burmese Teak.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">White-Glove Delivery</h4>
                <p className="text-xs text-gray-400 mt-0.5">Complimentary pan-India setup by temple experts.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Vastu Shastra Compliant</h4>
                <p className="text-xs text-gray-400 mt-0.5">Exact sacred dimensional ratios and orientations.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5-Year Warranty</h4>
                <p className="text-xs text-gray-400 mt-0.5">Comprehensive structural & termite protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <BrandLogo 
              config={brandConfig}
              variant="footer"
              theme="dark"
              align="left"
              onClick={() => navigateTo('home')}
            />
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              {brandConfig.footerDescription}
            </p>

            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fdcc87] shrink-0" />
                <span>Ateliers: {brandConfig.workshopLocations}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#fdcc87] shrink-0" />
                <span>Sanctum Concierge: {brandConfig.contactPhone} (Mon-Sat, 9AM - 8PM)</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h5 className="text-sm font-bold text-[#fdcc87] uppercase tracking-wider mb-4">
              Sacred Collections
            </h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button onClick={() => navigateTo('catalog', { category: 'Traditional' })} className="hover:text-[#fdcc87] transition-colors">
                  Traditional Carved Mandirs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('catalog', { category: 'Modern' })} className="hover:text-[#fdcc87] transition-colors">
                  Modern LED Sanctums
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('catalog', { category: 'Home Mandirs' })} className="hover:text-[#fdcc87] transition-colors">
                  Apartment Wall Mandirs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('catalog', { category: 'Temple Style' })} className="hover:text-[#fdcc87] transition-colors">
                  Grand Haveli Gopurams
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('custom')} className="hover:text-[#fdcc87] transition-colors font-medium text-amber-300">
                  Custom Bespoke Mandir ✨
                </button>
              </li>
            </ul>
          </div>

          {/* Vastu & Care */}
          <div>
            <h5 className="text-sm font-bold text-[#fdcc87] uppercase tracking-wider mb-4">
              Sanctum Guides
            </h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#fdcc87] transition-colors">
                  Our Artisanal Lineage
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('custom')} className="hover:text-[#fdcc87] transition-colors">
                  Vastu Direction Consultation
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#fdcc87] transition-colors">
                  Wood Seasoning Process
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('account')} className="hover:text-[#fdcc87] transition-colors">
                  Track Your Mandir Crafting
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin-dashboard')} className="hover:text-[#fdcc87] transition-colors text-xs text-gray-400">
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h5 className="text-sm font-bold text-[#fdcc87] uppercase tracking-wider mb-4">
              Sacred Heritage Journal
            </h5>
            <p className="text-xs text-gray-300 mb-3">
              Receive auspicious festival dates, Vastu placement tips, and preview new architectural designs.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#570000] rounded-xl text-xs text-white">
                <Check className="w-4 h-4 text-[#fdcc87]" />
                <span>Blessings! You are subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#fdcc87]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#570000] hover:bg-[#800000] text-[#fdcc87] hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#c59b27]/40"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 gap-4 text-center md:text-left">
          <p>{brandConfig.copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
            <button onClick={() => navigateTo('story')} className="hover:text-[#fdcc87] transition-colors">Privacy Policy</button>
            <button onClick={() => navigateTo('story')} className="hover:text-[#fdcc87] transition-colors">Terms of Service</button>
            <button onClick={() => navigateTo('story')} className="hover:text-[#fdcc87] transition-colors">Vastu Shastra Certificate</button>
            <button onClick={() => navigateTo('admin-dashboard')} className="text-[#fdcc87] hover:underline font-semibold">Store Administration</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
