/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  image: string;
  imageFile?: File;
  images?: string[];
  imageFiles?: File[];
  secondaryImage?: string;
  secondaryImageFile?: File;
  description?: string;
  details?: string[];
  composition?: string;
  care?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  price: number;
  originalPrice?: number;
  stock: number;
  sizeStock?: Record<string, number> | null;
  status: 'active' | 'draft';
  location?: string;
}

export interface Order {
  id: string;
  dbId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  date: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  fulfillmentStatus: 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Pending' | 'Cancelled';
  avatarInitials?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  couponDiscount?: number;
  trackingUrl?: string;
  address?: {
    fullName?: string;
    name?: string;
    phone?: string;
    street?: string;
    line1?: string;
    line2?: string;
    city?: string;
    country?: string;
  };
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  items?: {
    id: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: { name?: string; hex?: string };
    subtotal: number;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  parent: string | 'None';
  image: string;
  imageFile?: File;
  description: string;
  isDynamic: boolean;
  sortOrder?: number;
  sizes?: string[] | string | null;
  genderFilter?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate: string;
  avatar?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  method: string;
  status: 'Settled' | 'Pending' | 'Failed';
}

export interface Coupon {
  id?: string;
  code: string;
  status: 'Active' | 'Expired';
  discountText: string;
  description: string;
  usageUsed: number;
  usageLimit?: number;
  expiryDate: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: 'new' | 'reviewing' | 'closed';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  tag: string;
  rating: number;
  review: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type AboutStat = [string, string];

export interface AboutValue {
  title: string;
  text: string;
}

export interface StoreSettings {
  announcementItems: string[];
  storeName: string;
  currency: string;
  contactEmail: string;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  defaultGstRate: number;
  razorpayActive: boolean;
  onlinePaymentEnabled: boolean;
  codEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
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
  privacyPolicy: string;
  termsConditions: string;
  returnRefundPolicy: string;
}

export type StoryCategoryKey = 'uppers' | 'lowers' | 'dresses' | 'co-ords' | 'footwear' | 'accessories' | 'inners';

export interface StoryCategoryContent {
  key: StoryCategoryKey;
  label: string;
  eyebrow: string;
  description: string;
  cta: string;
  categories: string[];
  imageFallback: string;
  images: Partial<Record<'men' | 'women' | 'default', string>>;
  subcategories?: string[];
}
