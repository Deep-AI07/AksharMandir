import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, TreePine, Award, Hammer, Compass, Heart, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div id="about-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdcc87]/20 text-[#570000] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Generational Woodcraft Heritage</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1f1c1b] leading-tight">
          Crafting Beautiful Pooja Ghar Mandirs for Modern Homes
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          At Akshar Mandir, we preserve centuries of Gujarati and Indian woodcarving traditions, handcrafting home mandirs that bring peace, positive energy, and Bhakti at Home into everyday family life.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-[#eae5e2] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#570000] text-[#fdcc87] flex items-center justify-center font-bold">
            <TreePine className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">100% Ethically Seasoned Timber</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every mandir is carved exclusively from seasoned North Indian Sheesham (Dalbergia sissoo) and Burmese Teak, naturally moisture-cured for termite and warp resistance over decades.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#eae5e2] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#570000] text-[#fdcc87] flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Vastu & Shilpa Shastra Proportions</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Dimensions and mandir layout follow authentic Vastu Shastra principles, ensuring idols rest at an elevated auspicious plane while harmonizing energy in North-East and East directions.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#eae5e2] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#570000] text-[#fdcc87] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Master Artisan Heritage</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every dome Gopuram, jharokha arch, and jaali lattice is chiseled by hereditary master craftsmen whose families have sculpted temple shrines for four generations.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#2b2422] text-white border border-[#d4af37]/30 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold">Bring a Beautiful Pooja Ghar to Your Home</h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
          Explore our signature handcrafted mandirs or configure a bespoke temple tailored to your exact pooja room dimensions.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/mandirs" className="px-8 py-3.5 rounded-xl bg-[#fdcc87] text-[#3e0000] text-xs font-bold hover:bg-[#ffe3b3]">
            Explore Collections
          </Link>
          <Link to="/custom-mandir" className="px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20">
            Create Custom Mandir
          </Link>
        </div>
      </div>
    </div>
  );
};
