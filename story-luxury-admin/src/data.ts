import { Product, Order, Category, Customer, PaymentTransaction, Coupon, StoreSettings } from './types';

// All data is loaded from the API.
// These are empty — kept for type compatibility only.
export const initialProducts: Product[] = [];
export const initialOrders: Order[] = [];
export const initialCategories: Category[] = [];
export const initialCustomers: Customer[] = [];
export const initialTransactions: PaymentTransaction[] = [];
export const initialCoupons: Coupon[] = [];

// defaultSettings is used as a UI fallback while settings load from the API.
export const defaultSettings: StoreSettings = {
  announcementItems: [
    'FREE SHIPPING ON ORDERS ABOVE INR 999',
    'NEW ARRIVALS EVERY WEEK',
    'EASY RETURNS & EXCHANGES',
    'CURATED IN INDIA FOR YOU'
  ],
  storeName: 'STORY India',
  currency: 'INR',
  contactEmail: 'care@storyonline.in',
  baseDeliveryFee: 149,
  freeDeliveryThreshold: 5000,
  defaultGstRate: 18,
  razorpayActive: true,
  onlinePaymentEnabled: true,
  codEnabled: false,
  razorpayKeyId: '',
  razorpayKeySecret: '',
  heroEyebrow: '',
  heroTitle: '',
  heroBody: '',
  heroPrimaryCta: 'Shop Now',
  heroSecondaryCta: 'Explore',
  heroImagePrimary: '',
  heroImageSecondary: '',
  heroImageDetail: '',
  heroImageFourth: '',
  heroImageFifth: '',
  heroImageSixth: '',
  heroBadgeEyebrow: '',
  heroBadgeText: '',
  productsEyebrow: '',
  productsTitle: 'Our Products',
  productsBody: '',
  homeProductIds: [],
  collectionEyebrow: '',
  collectionTitle: '',
  collectionBody: '',
  collectionImage: '',
  collectionProductIds: [],
  discoverEyebrow: '',
  discoverTitle: '',
  discoverSearchPlaceholder: '',
  discoverTagLabel: '',
  jewelryEyebrow: '',
  jewelryTitle: '',
  jewelryBody: '',
  recommendationEyebrow: '',
  recommendationTitle: '',
  recommendationProductIds: [],
  storyCategories: [],
  aboutEyebrow: '',
  aboutTitle: '',
  aboutIntroParagraph1: '',
  aboutIntroParagraph2: '',
  aboutPrimaryCtaText: '',
  aboutSecondaryCtaText: '',
  aboutImage1: '',
  aboutImage2: '',
  aboutImage3: '',
  aboutBadgeText: '',
  aboutStats: [],
  aboutValuesEyebrow: '',
  aboutValuesTitle: '',
  aboutValues: [],
  aboutPromiseEyebrow: '',
  aboutPromiseTitle: '',
  aboutPromiseBody: '',
  aboutPromiseImage: '',
  privacyPolicy: '',
  termsConditions: '',
  returnRefundPolicy: ''
};
