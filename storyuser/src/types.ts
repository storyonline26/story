export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId?: string;
  image: string;
  secondaryImage?: string;
  listImages?: string[];
  description?: string;
  details?: string[];
  composition?: string;
  care?: string;
  sizes?: string[]; // e.g. ["S", "M", "L", "XL"]
  colors?: ColorOption[];
  stock?: number;
  gender?: string;
  sizeStock?: Record<string, number> | null;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive?: boolean;
  productCount: number;
  sortOrder: number;
  isDynamic?: boolean;
  parent?: string;
  sizes?: string[];
  genderFilter?: string;
}

export interface CartItem {
  id: string; // unique id combining productId + size + color
  product: Product;
  selectedSize: string;
  selectedColor: ColorOption;
  quantity: number;
}

export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  phone?: string;
  street: string;
  line1?: string;
  line2?: string;
  city: string;
  cityName?: string;
  state?: string;
  pincode?: string;
  country: string;
  isDefault?: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  newsletter: boolean;
}

export interface Order {
  id: string;
  date: string;
  status?: string;
  paymentStatus?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Address;
  paymentMethod: string;
  trackingUrl?: string;
}

export interface CustomerReview {
  id?: string;
  name: string;
  tag: string;
  rating: number;
  review: string;
  status?: string;
  createdAt?: string;
}

export type AboutStat = [string, string];

export interface AboutValue {
  title: string;
  text: string;
}

export interface StorefrontContent {
  announcementItems: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroImagePrimary: string;
  heroImageSecondary: string;
  heroImageDetail: string;
  heroImageFourth: string;
  heroImageFifth: string;
  heroImageSixth: string;
  heroBadgeEyebrow: string;
  heroBadgeText: string;
  productsEyebrow: string;
  productsTitle: string;
  productsBody: string;
  homeProductIds: string[];
  collectionEyebrow: string;
  collectionTitle: string;
  collectionBody: string;
  collectionImage: string;
  collectionProductIds: string[];
  discoverEyebrow: string;
  discoverTitle: string;
  discoverSearchPlaceholder: string;
  discoverTagLabel: string;
  jewelryEyebrow: string;
  jewelryTitle: string;
  jewelryBody: string;
  recommendationEyebrow: string;
  recommendationTitle: string;
  recommendationProductIds: string[];
  storyCategories: StoryCategoryContent[];
  aboutEyebrow: string;
  aboutTitle: string;
  aboutIntroParagraph1: string;
  aboutIntroParagraph2: string;
  aboutPrimaryCtaText: string;
  aboutSecondaryCtaText: string;
  aboutImage1: string;
  aboutImage2: string;
  aboutImage3: string;
  aboutBadgeText: string;
  aboutStats: AboutStat[];
  aboutValuesEyebrow: string;
  aboutValuesTitle: string;
  aboutValues: AboutValue[];
  aboutPromiseEyebrow: string;
  aboutPromiseTitle: string;
  aboutPromiseBody: string;
  aboutPromiseImage: string;
  razorpayActive: boolean;
  onlinePaymentEnabled: boolean;
  codEnabled: boolean;
  privacyPolicy: string;
  termsConditions: string;
  returnRefundPolicy: string;
}

export type StoryCategoryKey = 'uppers' | 'lowers' | 'dresses' | 'co-ords' | 'footwear' | 'accessories' | 'inners';

export interface StoryCategoryContent {
  key: StoryCategoryKey;
  label?: string;
  eyebrow?: string;
  description?: string;
  cta?: string;
  categories?: string[];
  imageFallback?: string;
  images?: Partial<Record<'men' | 'women' | 'default', string>>;
  subcategories?: string[];
}

export type ActiveScreen = 'shop' | 'about' | 'contact' | 'discover' | 'category' | 'detail' | 'settings' | 'confirmation' | 'login' | 'bag' | 'policy';
