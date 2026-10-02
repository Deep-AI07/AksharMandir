export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  badge?: string | null;
  orderIndex: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  categoryId?: string;
  category?: Category;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  stock?: number;
  inStock: boolean;
  material: string;
  dimensions: string;
  mountingType: string;
  mounting?: string;
  colorFinish: string;
  finish?: string;
  availableFinishes: string[];
  weight: string;
  warranty: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  vastuNotes: string;
  tags: string[];
  images: string[];
  isCustomizable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'COMING_SOON';
  rating: number;
  reviewsCount: number;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface CartItem {
  id?: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedFinish: string;
  customNotes?: string;
  subtotal?: number;
  isStockSufficient?: boolean;
}

export interface CustomMandirRequest {
  id: string;
  requestNumber?: string;
  userId?: string | null;
  fullName: string;
  customerName?: string;
  phone: string;
  customerPhone?: string;
  email: string;
  customerEmail?: string;
  city: string;
  pincode: string;
  width: string;
  depth: string;
  height: string;
  unit: 'Inches' | 'Feet' | string;
  materialPreference: string;
  finishType: string;
  mounting: string;
  features: string[];
  engravingRequirements?: string | null;
  additionalRequirements?: string | null;
  referenceImageUrl?: string | null;
  referenceImageName?: string | null;
  estimatedQuote: number;
  advanceAmount?: number;
  remainingAmount?: number;
  status: 'PENDING_REVIEW' | 'QUOTED' | 'CAD_READY' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED' | 'Pending Review' | 'CAD Design Ready' | 'In Production' | 'Completed';
  adminNotes?: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string | null;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Office' | 'Pooja Ghar' | string;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  title: string;
  sku?: string;
  image: string;
  finish: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'CANCELLED' | 'Processing' | 'Artisan Crafting' | 'Quality Check' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type DeliveryStatus = 'NOT_DELIVERED' | 'DELIVERED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'QR' | 'CARD' | 'COD' | 'UPI / QR' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery';

export interface Payment {
  id: string;
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date?: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address;
  addressSnapshot?: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  deliveryStatus: DeliveryStatus;
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string | null;
  notes?: string | null;
  payments?: Payment[];
  estimatedDelivery?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: 'CUSTOMER' | 'ADMIN';
  avatarUrl?: string | null;
  preferredDeity?: string | null;
  addresses: Address[];
}

export interface Review {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    sku: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  timesUsed: number;
  startDate?: string | null;
  endDate?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface ShopOwner {
  id: string;
  name: string;
  role: string;
  experience: string;
  bio: string;
  image: string;
  badge?: string;
  permission?: string;
}

export interface BrandConfig {
  name: string;
  brandName?: string;
  tagline: string;
  subTagline?: string;
  supportPhone: string;
  contactPhone?: string;
  supportEmail: string;
  contactEmail?: string;
  workshopLocations: string;
  primaryColor: string;
  accentColor: string;
  logoIcon: 'temple' | 'om' | 'kalash';
  logoUrl?: string;
  logoAltText?: string;
  footerDescription?: string;
  copyrightText?: string;
  owners?: ShopOwner[];
  ownersSectionTitle?: string;
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
