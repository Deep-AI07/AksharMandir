export type ProductCategory = 'Traditional' | 'Modern' | 'Home Mandirs' | 'Temple Style';

export type MandirMaterial = 
  | 'Sheesham Wood' 
  | 'Teak Wood' 
  | 'Rosewood' 
  | 'White Cedar' 
  | 'Composite Marble' 
  | 'Brass Inlay Teak';

export type FinishType = 
  | 'Natural Teak Polish' 
  | 'Dark Walnut' 
  | 'Antique Honey' 
  | 'Heritage Rosewood' 
  | 'Matte Ivory & Gold' 
  | 'Pure White PU';

export type MountingType = 'Floor Rested' | 'Wall Mounted' | 'Convertible (Floor/Wall)';

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  rating: number;
  reviewsCount: number;
  sku: string;
  stock: number;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  material: MandirMaterial;
  dimensions: string; // e.g. "36\"W x 24\"D x 48\"H"
  mounting: MountingType;
  finish: FinishType;
  availableFinishes: FinishType[];
  weight: string; // e.g. "42 kg"
  warranty: string; // e.g. "5 Years Structural"
  shortDescription: string;
  fullDescription: string;
  features: string[];
  vastuNotes: string;
  images: string[];
  tags: string[];
  status: 'active' | 'draft' | 'inactive' | 'coming_soon';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFinish: FinishType;
  customNotes?: string;
}

export interface CustomMandirRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  pincode: string;
  width: string;
  depth: string;
  height: string;
  unit: 'Inches' | 'Feet';
  materialPreference: MandirMaterial;
  finishType: FinishType;
  mounting: MountingType;
  features: string[];
  engravingRequirements?: string;
  additionalRequirements?: string;
  referenceImageName?: string;
  referenceImageUrl?: string;
  estimatedQuote: number;
  status: 'Pending Review' | 'CAD Design Ready' | 'In Production' | 'Completed';
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'Home' | 'Office' | 'Sanctum';
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  finish: FinishType;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Processing' | 'Artisan Crafting' | 'Quality Check' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'UPI / QR' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery';
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  preferredDeity?: string;
  addresses: Address[];
}

export interface FilterState {
  category: string;
  material: string;
  finish: string;
  mounting: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
  inStockOnly: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
