import { Category, ContactRequest, Coupon, Customer, CustomerReview, Order, PaymentTransaction, Product, StoreSettings } from './types';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000/api').replace(/\/$/, '');

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

export interface DashboardStats {
  revenue: {
    today: number;
    month: number;
    allTime: number;
  };
  orders: {
    total: number;
    today: number;
    month: number;
  };
  products: number;
  users: number;
  lowStockProducts: number;
  recentOrders: Order[];
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store'
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error((payload as { message?: string }).message || `Request failed with ${response.status}`);
  }

  return (payload as ApiEnvelope<T>).data;
}

const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
const slugify = (value: string) => value.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const mapProduct = (product: any): Product => ({
  id: String(product.id),
  name: product.name,
  sku: product.sku || 'STORY-SKU',
  category: product.category || 'Uncategorised',
  categoryId: product.categoryId,
  image: product.image || product.images?.[0] || '',
  images: Array.isArray(product.listImages) ? product.listImages : Array.isArray(product.images) ? product.images : [],
  secondaryImage: product.secondaryImage || '',
  description: product.description || '',
  details: Array.isArray(product.details) ? product.details : [],
  composition: product.composition || '',
  care: product.care || '',
  sizes: Array.isArray(product.sizes) ? product.sizes : [],
  colors: Array.isArray(product.colors) ? product.colors : [],
  price: Number(product.price || 0),
  originalPrice: product.originalPrice === undefined ? undefined : Number(product.originalPrice),
  stock: Number(product.stock || 0),
  status: product.status === 'draft' || product.isActive === false ? 'draft' : 'active'
});

const mapCategory = (category: any): Category => ({
  id: String(category.id),
  name: category.name,
  slug: category.slug,
  productCount: Number(category.productCount || 0),
  status: category.status || (category.isActive === false ? 'Inactive' : 'Active'),
  parent: category.parent || 'None',
  image: category.image || '',
  description: category.description || '',
  isDynamic: Boolean(category.isDynamic),
  sortOrder: Number(category.sortOrder || 0),
  sizes: category.sizes || null,
  genderFilter: category.genderFilter || 'all'
});

const mapOrder = (order: any): Order => ({
  id: String(order.id),
  dbId: order.dbId,
  customerName: order.customerName || order.address?.fullName || 'STORY Client',
  customerEmail: order.customerEmail || '',
  amount: Number(order.amount || order.total || 0),
  date: order.date ? new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
  paymentStatus: titleCase(order.paymentStatus || 'pending') as Order['paymentStatus'],
  fulfillmentStatus: titleCase(order.fulfillmentStatus || order.status || 'processing') as Order['fulfillmentStatus'],
  avatarInitials: String(order.customerName || order.address?.fullName || 'ST').slice(0, 2).toUpperCase(),
  subtotal: Number(order.subtotal || 0),
  shipping: Number(order.shipping || 0),
  tax: Number(order.tax || 0),
  couponDiscount: Number(order.couponDiscount || 0),
  trackingUrl: order.trackingUrl || '',
  address: order.address,
  paymentMethod: order.paymentMethod || 'Razorpay',
  razorpayOrderId: order.razorpayOrderId || '',
  razorpayPaymentId: order.razorpayPaymentId || '',
  items: Array.isArray(order.items) ? order.items.map((item: any) => ({
    id: String(item.id),
    name: item.name || 'Product',
    image: item.image || '',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    selectedSize: item.selectedSize || '',
    selectedColor: item.selectedColor || undefined,
    subtotal: Number(item.subtotal || 0)
  })) : []
});

const mapCustomer = (user: any): Customer => ({
  id: String(user.id),
  name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'STORY Client',
  email: user.email || '',
  location: 'India',
  ordersCount: Number(user.ordersCount || 0),
  totalSpend: Number(user.totalSpend || 0),
  lastOrderDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'New'
});

const mapPayment = (payment: any): PaymentTransaction => ({
  id: String(payment.id),
  orderId: String(payment.orderId),
  date: payment.date ? new Date(payment.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
  amount: Number(payment.amount || 0),
  method: payment.method || 'Razorpay',
  status: (payment.status || 'Pending') as PaymentTransaction['status']
});

const mapCoupon = (coupon: any): Coupon => ({
  id: coupon.id,
  code: coupon.code,
  status: coupon.status || (coupon.isActive === false ? 'Expired' : 'Active'),
  discountText: coupon.discountText || `${coupon.value || 0}% Off`,
  description: coupon.description || '',
  usageUsed: Number(coupon.usageUsed || coupon.usedCount || 0),
  usageLimit: coupon.usageLimit,
  expiryDate: coupon.expiryDate || 'No Expiry'
});

const asBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

const listFromSetting = (value: unknown, fallback: string[] = []) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string') return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const settingList = (value: string[]) => value.filter(Boolean).join(',');

const jsonListFromSetting = <T,>(value: unknown, fallback: T[] = []) => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_ABOUT_STATS: [string, string][] = [
  ['2026', 'Founded'],
  ['7', 'Core categories'],
  ['100%', 'Original focus'],
  ['INDIA', 'Curated for']
];

const DEFAULT_ABOUT_VALUES = [
  {
    title: 'Authentic',
    text: 'Every piece is checked for brand identity, condition, finish, and everyday wearability before it enters the STORY edit.'
  },
  {
    title: 'Curated',
    text: 'We select branded fashion for Indian wardrobes: sharp layers, premium basics, clean footwear, and easy occasion pieces.'
  },
  {
    title: 'Value',
    text: 'The goal is simple: original branded fashion, better prices, and quality that feels worth returning to.'
  }
];

const mapSettings = (settings: any): StoreSettings => ({
  announcementItems: listFromSetting(settings.announcement_ticker_items || settings.announcementItems, [
    'FREE SHIPPING ON ORDERS ABOVE INR 999',
    'SALE 20% OFF',
    '100% AUTHENTIC BRANDED FASHION',
    'NEW ARRIVALS EVERY WEEK',
    'EASY RETURNS & EXCHANGES',
    'CURATED IN INDIA FOR YOU'
  ]),
  storeName: settings.store_name || settings.storeName || 'STORY India',
  currency: settings.razorpay_currency || settings.currency || 'INR',
  contactEmail: settings.store_email || settings.contactEmail || 'orders@story.in',
  baseDeliveryFee: Number(settings.delivery_fee || settings.baseDeliveryFee || 149),
  freeDeliveryThreshold: Number(settings.free_delivery_above || settings.freeDeliveryThreshold || 5000),
  defaultGstRate: Number(settings.gst_percentage || settings.defaultGstRate || 18),
  razorpayActive: asBoolean(settings.razorpay_active ?? settings.razorpayActive, true),
  onlinePaymentEnabled: asBoolean(settings.online_payment_enabled ?? settings.onlinePaymentEnabled, true),
  codEnabled: asBoolean(settings.cod_enabled ?? settings.codEnabled, false),
  razorpayKeyId: settings.razorpay_key_id || settings.razorpayKeyId || '',
  razorpayKeySecret: '',
  heroEyebrow: settings.home_hero_eyebrow || settings.heroEyebrow || 'New editorial capsule',
  heroTitle: settings.home_hero_title || settings.heroTitle || 'Our Latest Story',
  heroBody: settings.home_hero_body || settings.heroBody || 'Discover timeless fashion pieces crafted in India for everyday elegance.',
  heroPrimaryCta: settings.home_hero_primary_cta || settings.heroPrimaryCta || 'Shop Edit',
  heroSecondaryCta: settings.home_hero_secondary_cta || settings.heroSecondaryCta || 'View Lookbook',
  heroImagePrimary: settings.home_hero_image_primary || settings.heroImagePrimary || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85',
  heroImageSecondary: settings.home_hero_image_secondary || settings.heroImageSecondary || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  heroImageDetail: settings.home_hero_image_detail || settings.heroImageDetail || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
  heroImageFourth: settings.home_hero_image_fourth || settings.heroImageFourth || '',
  heroImageFifth: settings.home_hero_image_fifth || settings.heroImageFifth || '',
  heroImageSixth: settings.home_hero_image_sixth || settings.heroImageSixth || '',
  heroBadgeEyebrow: settings.home_hero_badge_eyebrow || settings.heroBadgeEyebrow || 'Story India 2026',
  heroBadgeText: settings.home_hero_badge_text || settings.heroBadgeText || 'Tailored quiet luxury',
  productsEyebrow: settings.home_products_eyebrow || settings.productsEyebrow || 'Seasonal selection',
  productsTitle: settings.home_products_title || settings.productsTitle || 'Our Products',
  productsBody: settings.home_products_body || settings.productsBody || 'Explore curated essentials across clothing, footwear, and everyday luxury.',
  homeProductIds: listFromSetting(settings.home_products_ids || settings.homeProductIds, ['wide-legged-pants', 'relaxed-linen-shirt', 'crew-neck-sweater', 'classic-mini-dress', 'canvas-tote-bag', 'elongated-blazer', 'oversized-wool-coat', 'rib-knit-tank-top']),
  collectionEyebrow: settings.home_collection_eyebrow || settings.collectionEyebrow || 'Curated combinations',
  collectionTitle: settings.home_collection_title || settings.collectionTitle || 'Perfect Match',
  collectionBody: settings.home_collection_body || settings.collectionBody || 'Explore curated collections designed to complement your style with comfort and confidence.',
  collectionImage: settings.home_collection_image || settings.collectionImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  collectionProductIds: listFromSetting(settings.home_collection_product_ids || settings.collectionProductIds, []),
  discoverEyebrow: settings.discover_eyebrow || settings.discoverEyebrow || 'OUR COMPLETE CODES',
  discoverTitle: settings.discover_title || settings.discoverTitle || 'COLLECTIONS',
  discoverSearchPlaceholder: settings.discover_search_placeholder || settings.discoverSearchPlaceholder || 'SEARCH PRODUCTS, STYLING OR RELEASES...',
  discoverTagLabel: settings.discover_tag_label || settings.discoverTagLabel || 'STYLING DIARY:',
  jewelryEyebrow: settings.home_jewelry_eyebrow || settings.jewelryEyebrow || 'Accessories edit',
  jewelryTitle: settings.home_jewelry_title || settings.jewelryTitle || 'Story Jewelry',
  jewelryBody: settings.home_jewelry_body || settings.jewelryBody || 'Adorn yourself with timeless accessories that complete every look.',
  recommendationEyebrow: settings.home_recommendation_eyebrow || settings.recommendationEyebrow || 'Selected next',
  recommendationTitle: settings.home_recommendation_title || settings.recommendationTitle || 'Recommendation',
  recommendationProductIds: listFromSetting(settings.home_recommendation_ids || settings.recommendationProductIds, ['linen-wide-pants', 'faux-leather-jacket', 'gray-tube-top', 'drawstring-linen-pants', 'convertible-crossbody-bag']),
  storyCategories: jsonListFromSetting(settings.story_categories || settings.storyCategories, []),
  aboutEyebrow: settings.about_eyebrow || settings.aboutEyebrow || 'About STORY India',
  aboutTitle: settings.about_title || settings.aboutTitle || 'Verified Fashion, Curated In India',
  aboutIntroParagraph1: settings.about_intro_paragraph_1 || settings.aboutIntroParagraph1 || 'STORY is a premium India-based fashion store built for people who want original branded pieces without the noise of fast, careless shopping.',
  aboutIntroParagraph2: settings.about_intro_paragraph_2 || settings.aboutIntroParagraph2 || 'We curate verified branded fashion across uppers, lowers, dresses, co-ords, footwear, accessories, and inners, with a focus on authenticity, condition, price, and everyday Indian style.',
  aboutPrimaryCtaText: settings.about_primary_cta_text || settings.aboutPrimaryCtaText || 'Shop Verified Picks',
  aboutSecondaryCtaText: settings.about_secondary_cta_text || settings.aboutSecondaryCtaText || 'View Curated Drops',
  aboutImage1: settings.about_image_1 || settings.aboutImage1 || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  aboutImage2: settings.about_image_2 || settings.aboutImage2 || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  aboutImage3: settings.about_image_3 || settings.aboutImage3 || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  aboutBadgeText: settings.about_badge_text || settings.aboutBadgeText || 'Premium branded fashion, checked, styled, and priced for modern Indian wardrobes.',
  aboutStats: jsonListFromSetting(settings.about_stats || settings.aboutStats, DEFAULT_ABOUT_STATS),
  aboutValuesEyebrow: settings.about_values_eyebrow || settings.aboutValuesEyebrow || 'Our standard',
  aboutValuesTitle: settings.about_values_title || settings.aboutValuesTitle || 'Original Pieces, Clear Checks',
  aboutValues: jsonListFromSetting(settings.about_values || settings.aboutValues, DEFAULT_ABOUT_VALUES),
  aboutPromiseEyebrow: settings.about_promise_eyebrow || settings.aboutPromiseEyebrow || 'The STORY promise',
  aboutPromiseTitle: settings.about_promise_title || settings.aboutPromiseTitle || 'Verified Authentic. Best Price. Better Quality.',
  aboutPromiseBody: settings.about_promise_body || settings.aboutPromiseBody || 'From first scroll to final delivery, STORY keeps the edit focused: real branded pieces, clean product presentation, reliable support, and fashion that fits Indian everyday life.',
  aboutPromiseImage: settings.about_promise_image || settings.aboutPromiseImage || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
  privacyPolicy: settings.privacy_policy || settings.privacyPolicy || 'We respect your privacy and use customer information only to process orders, provide support, improve the shopping experience, and meet legal or payment requirements. We do not sell customer data. Payment information is processed securely by our payment partners.',
  termsConditions: settings.terms_conditions || settings.termsConditions || 'By using STORY India, you agree to provide accurate account, delivery, and payment information. Product availability, pricing, promotions, and delivery timelines may change without prior notice. Orders are confirmed only after successful payment and verification.',
  returnRefundPolicy: settings.return_refund_policy || settings.returnRefundPolicy || 'Returns or exchanges may be requested for eligible unused products within the return window shown at purchase. Items must be returned with tags, packaging, and invoice. Refunds are processed to the original payment method after quality check approval.'
});

const mapContactRequest = (request: any): ContactRequest => ({
  id: String(request.id),
  name: request.name || 'Client',
  email: request.email || '',
  phone: request.phone || '',
  topic: request.topic || '',
  message: request.message || '',
  status: request.status || 'new',
  createdAt: request.createdAt || ''
});

const mapReview = (review: any): CustomerReview => ({
  id: String(review.id),
  name: review.name || 'STORY Customer',
  tag: review.tag || 'VERIFIED PURCHASE',
  rating: Number(review.rating || 5),
  review: review.review || '',
  status: review.status || 'pending',
  createdAt: review.createdAt || ''
});

const compactObject = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ''));

const appendFormValue = (formData: FormData, key: string, value: unknown) => {
  if (value !== undefined && value !== null && value !== '') formData.append(key, String(value));
};

const toProductPayload = (product: Omit<Product, 'id'> | Partial<Product>) => {
  const imageUrls = product.images?.length ? product.images : product.image ? [product.image] : undefined;
  const cleanImageUrls = imageUrls?.filter((image) => image && !image.startsWith('blob:'));
  const payload = compactObject({
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    categorySlug: product.category ? slugify(product.category) : undefined,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    isActive: product.status ? product.status === 'active' : undefined,
    description: product.description,
    details: product.details,
    composition: product.composition,
    care: product.care,
    sizes: product.sizes,
    colors: product.colors,
    images: cleanImageUrls?.length ? cleanImageUrls : undefined,
    secondaryImage: product.secondaryImage && !product.secondaryImage.startsWith('blob:') ? product.secondaryImage : undefined
  });

  const files = [
    ...(product.imageFiles || []),
    ...(product.imageFile ? [product.imageFile] : [])
  ];

  if (!files.length && !product.secondaryImageFile) return payload;

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    appendFormValue(formData, key, Array.isArray(value) ? JSON.stringify(value) : value);
  }
  files.forEach((file) => formData.append('images', file));
  if (product.secondaryImageFile) formData.append('secondaryImageFile', product.secondaryImageFile);
  return formData;
};

const toCategoryPayload = (category: Omit<Category, 'id' | 'productCount'> | Partial<Category>) => {
  const payload = compactObject({
    name: category.name,
    description: category.description,
    imageUrl: category.image && !category.image.startsWith('blob:') ? category.image : undefined,
    parent: category.parent,
    isDynamic: category.isDynamic,
    sortOrder: category.sortOrder,
    isActive: category.status ? category.status === 'Active' : undefined,
    sizes: (category as any).sizes || undefined,
    genderFilter: (category as any).genderFilter || undefined
  });

  if (!category.imageFile) return payload;

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) appendFormValue(formData, key, value);
  formData.append('image', category.imageFile);
  return formData;
};

const asRequestBody = (payload: FormData | Record<string, unknown>) =>
  payload instanceof FormData ? payload : JSON.stringify(payload);

const couponPayload = (coupon: Omit<Coupon, 'usageUsed'>) => {
  const percent = coupon.discountText.match(/(\d+(?:\.\d+)?)\s*%/);
  const flat = coupon.discountText.match(/(?:INR|RS\.?)\s*(\d+(?:\.\d+)?)/i);

  return {
    code: coupon.code,
    type: flat ? 'flat' : 'percentage',
    value: Number(flat?.[1] || percent?.[1] || 10),
    minOrderValue: 0,
    usageLimit: coupon.usageLimit,
    isActive: coupon.status === 'Active',
    expiresAt: /^\d{4}-\d{2}-\d{2}/.test(coupon.expiryDate) ? new Date(coupon.expiryDate).toISOString() : null
  };
};

const settingsPayload = (settings: StoreSettings) => ({
  announcement_ticker_items: settingList(settings.announcementItems),
  store_name: settings.storeName,
  razorpay_currency: settings.currency,
  store_email: settings.contactEmail,
  delivery_fee: settings.baseDeliveryFee,
  free_delivery_above: settings.freeDeliveryThreshold,
  gst_percentage: settings.defaultGstRate,
  razorpay_active: settings.razorpayActive,
  online_payment_enabled: settings.onlinePaymentEnabled,
  cod_enabled: settings.codEnabled,
  razorpay_key_id: settings.razorpayKeyId,
  home_hero_eyebrow: settings.heroEyebrow,
  home_hero_title: settings.heroTitle,
  home_hero_body: settings.heroBody,
  home_hero_primary_cta: settings.heroPrimaryCta,
  home_hero_secondary_cta: settings.heroSecondaryCta,
  home_hero_image_primary: settings.heroImagePrimary,
  home_hero_image_secondary: settings.heroImageSecondary,
  home_hero_image_detail: settings.heroImageDetail,
  home_hero_image_fourth: settings.heroImageFourth,
  home_hero_image_fifth: settings.heroImageFifth,
  home_hero_image_sixth: settings.heroImageSixth,
  home_hero_badge_eyebrow: settings.heroBadgeEyebrow,
  home_hero_badge_text: settings.heroBadgeText,
  home_products_eyebrow: settings.productsEyebrow,
  home_products_title: settings.productsTitle,
  home_products_body: settings.productsBody,
  home_products_ids: settingList(settings.homeProductIds),
  home_collection_eyebrow: settings.collectionEyebrow,
  home_collection_title: settings.collectionTitle,
  home_collection_body: settings.collectionBody,
  home_collection_image: settings.collectionImage,
  home_collection_product_ids: settingList(settings.collectionProductIds),
  discover_eyebrow: settings.discoverEyebrow,
  discover_title: settings.discoverTitle,
  discover_search_placeholder: settings.discoverSearchPlaceholder,
  discover_tag_label: settings.discoverTagLabel,
  home_jewelry_eyebrow: settings.jewelryEyebrow,
  home_jewelry_title: settings.jewelryTitle,
  home_jewelry_body: settings.jewelryBody,
  home_recommendation_eyebrow: settings.recommendationEyebrow,
  home_recommendation_title: settings.recommendationTitle,
  home_recommendation_ids: settingList(settings.recommendationProductIds),
  story_categories: JSON.stringify(settings.storyCategories),
  about_eyebrow: settings.aboutEyebrow,
  about_title: settings.aboutTitle,
  about_intro_paragraph_1: settings.aboutIntroParagraph1,
  about_intro_paragraph_2: settings.aboutIntroParagraph2,
  about_primary_cta_text: settings.aboutPrimaryCtaText,
  about_secondary_cta_text: settings.aboutSecondaryCtaText,
  about_image_1: settings.aboutImage1,
  about_image_2: settings.aboutImage2,
  about_image_3: settings.aboutImage3,
  about_badge_text: settings.aboutBadgeText,
  about_stats: JSON.stringify(settings.aboutStats),
  about_values_eyebrow: settings.aboutValuesEyebrow,
  about_values_title: settings.aboutValuesTitle,
  about_values: JSON.stringify(settings.aboutValues),
  about_promise_eyebrow: settings.aboutPromiseEyebrow,
  about_promise_title: settings.aboutPromiseTitle,
  about_promise_body: settings.aboutPromiseBody,
  about_promise_image: settings.aboutPromiseImage,
  privacy_policy: settings.privacyPolicy,
  terms_conditions: settings.termsConditions,
  return_refund_policy: settings.returnRefundPolicy
});

export const adminApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ user: AdminUser; token: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.user.role !== 'admin') throw new Error('This account does not have admin access.');
    return data.user;
  },
  me: async () => {
    const data = await apiRequest<{ user: AdminUser }>('/auth/admin/me');
    if (data.user.role !== 'admin') throw new Error('This account does not have admin access.');
    return data.user;
  },
  logout: async () => {
    await apiRequest('/auth/admin/logout', { method: 'POST' }).catch(() => undefined);
  },
  dashboardStats: async () => {
    const stats = await apiRequest<any>('/admin/dashboard/stats');
    return {
      ...stats,
      recentOrders: Array.isArray(stats.recentOrders) ? stats.recentOrders.map(mapOrder) : []
    } as DashboardStats;
  },
  products: async () => (await apiRequest<any[]>('/admin/products')).map(mapProduct),
  createProduct: async (product: Omit<Product, 'id'>) =>
    mapProduct(await apiRequest('/admin/products', {
      method: 'POST',
      body: asRequestBody(toProductPayload(product))
    })),
  bulkCreateProducts: async (products: Omit<Product, 'id'>[]) => {
    const formData = new FormData();
    const productsData = products.map((p) => ({
      name: p.name, sku: p.sku, categoryId: p.categoryId,
      price: p.price, stock: p.stock, location: p.location,
      description: p.description, composition: p.composition, care: p.care,
      sizes: p.sizes ? JSON.stringify(p.sizes) : undefined,
      colors: p.colors ? JSON.stringify(p.colors) : undefined,
      details: p.details ? JSON.stringify(p.details) : undefined,
      images: p.images?.filter((img) => img && !img.startsWith('blob:')) || [],
      imageCount: p.imageFiles?.length || 0,
      isActive: p.status === 'active'
    }));
    formData.append('products', JSON.stringify(productsData));
    for (const product of products) {
      if (product.imageFiles) {
        for (const file of product.imageFiles) {
          formData.append('images', file);
        }
      }
    }
    const data = await apiRequest<any[]>('/admin/products/bulk', { method: 'POST', body: formData });
    return data.map(mapProduct);
  },
  updateProduct: async (id: string, product: Partial<Product>) =>
    mapProduct(await apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: asRequestBody(toProductPayload(product))
    })),
  updateStock: async (id: string, stock: number) =>
    mapProduct(await apiRequest(`/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock })
    })),
  deleteProduct: async (id: string) =>
    mapProduct(await apiRequest(`/admin/products/${id}`, { method: 'DELETE' })),
  categories: async () => (await apiRequest<any[]>('/admin/categories')).map(mapCategory),
  createCategory: async (category: Omit<Category, 'id' | 'productCount'>) =>
    mapCategory(await apiRequest('/admin/categories', {
      method: 'POST',
      body: asRequestBody(toCategoryPayload(category))
    })),
  updateCategory: async (id: string, category: Partial<Category>) =>
    mapCategory(await apiRequest(`/admin/categories/${id}`, {
      method: 'PUT',
      body: asRequestBody(toCategoryPayload(category))
    })),
  deleteCategory: async (id: string) =>
    mapCategory(await apiRequest(`/admin/categories/${id}`, { method: 'DELETE' })),
  coupons: async () => (await apiRequest<any[]>('/admin/coupons')).map(mapCoupon),
  createCoupon: async (coupon: Omit<Coupon, 'usageUsed'>) =>
    mapCoupon(await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponPayload(coupon))
    })),
  deleteCoupon: async (id: string) =>
    mapCoupon(await apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' })),
  orders: async () => (await apiRequest<any[]>('/admin/orders')).map(mapOrder),
  updateOrderStatus: async (id: string, paymentStatus: Order['paymentStatus'], fulfillmentStatus: Order['fulfillmentStatus'], trackingUrl?: string) =>
    mapOrder(await apiRequest(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        paymentStatus: paymentStatus.toLowerCase(),
        status: fulfillmentStatus.toLowerCase(),
        trackingUrl
      })
    })),
  customers: async () => (await apiRequest<any[]>('/admin/users?limit=100')).map(mapCustomer),
  payments: async () => (await apiRequest<any[]>('/admin/payments')).map(mapPayment),
  settings: async () => mapSettings(await apiRequest('/admin/settings')),
  saveSettings: async (settings: StoreSettings) =>
    mapSettings(await apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsPayload(settings))
    })),
  contactRequests: async () => (await apiRequest<any[]>('/admin/contact-requests')).map(mapContactRequest),
  updateContactRequestStatus: async (id: string, status: ContactRequest['status']) =>
    mapContactRequest(await apiRequest(`/admin/contact-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })),
  reviews: async () => (await apiRequest<any[]>('/admin/reviews')).map(mapReview),
  updateReviewStatus: async (id: string, status: CustomerReview['status']) =>
    mapReview(await apiRequest(`/admin/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })),
  deleteReview: async (id: string) =>
    mapReview(await apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }))
};
