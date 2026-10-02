import { BrandConfig, ShopOwner } from '../types';

export type { BrandConfig, ShopOwner };

export const DEFAULT_SHOP_OWNERS: ShopOwner[] = [
  {
    id: 'owner-1',
    name: 'Pandit Ramkrishna Sharma',
    role: 'Founder & Master Sthapati',
    experience: '3rd Gen Master Craftsman • 38 Years',
    bio: 'Steeped in 400-year-old Rajasthani temple carving traditions, shaping pure seasoned teakwood into auspicious spiritual homes for deities across the globe.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    badge: 'Founder & Lead Artisan'
  },
  {
    id: 'owner-2',
    name: 'Devkrishna Sharma',
    role: 'Principal Mandir Architect & Co-Founder',
    experience: 'Vedic Architecture & Acoustics • 16 Years',
    bio: 'Blending classical Vastu proportion mathematics with contemporary apartment aesthetics, laser-precise brass inlays, and soothing ambient illumination.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    badge: 'Temple Architect'
  },
  {
    id: 'owner-3',
    name: 'Acharya Madhavrao Joshi',
    role: 'Chief Timber Custodian & Vastu Lead',
    experience: 'Hardwood Botanist & Vastu Consultant • 28 Years',
    bio: 'Hand-inspecting every cubic log of aged Dalbergia sissoo (Sheesham) and Burma Teak to ensure zero defects, moisture control, and auspicious Vastu balance.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    badge: 'Vastu & Timber Head'
  }
];

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  name: 'AKSHAR MANDIR',
  brandName: 'AKSHAR MANDIR',
  tagline: 'Divine Modernity',
  subTagline: 'Handcrafted Home Mandirs & Pooja Ghar',
  logoUrl: '/images/akshar_mandir_logo.jpg', 
  logoAltText: 'Akshar Mandir Logo',
  logoIcon: 'temple',
  primaryColor: '#570000',
  accentColor: '#fdcc87',
  footerDescription: 'We handcraft timeless home mandirs that bring peace, devotion, and artisanal elegance into every Pooja Ghar across the globe.',
  copyrightText: '© 2026 Akshar Mandir. Handcrafted with devotion for your home and family.',
  supportPhone: '+91 98765 43210',
  contactPhone: '+91 98765 43210',
  supportEmail: 'blessings@aksharmandir.com',
  contactEmail: 'blessings@aksharmandir.com',
  workshopLocations: 'Saharanpur (Hardwood Crafting) & Jaipur (Carving Workshop)',
  owners: DEFAULT_SHOP_OWNERS,
  ownersSectionTitle: 'FOUNDER OWNER & CO-OWNER'
};

