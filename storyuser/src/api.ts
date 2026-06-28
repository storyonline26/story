import { Address, CartItem, Category, ColorOption, CustomerReview, Order, Product, StorefrontContent, UserProfile } from './types';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000/api').replace(/\/$/, '');

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthSession {
  user: UserProfile & { id?: string; role?: string };
  token?: string;
}

export interface CheckoutOrderResponse {
  order: Order;
  orderId: string;
  publicId: string;
  paymentMethod: 'online' | 'cod';
  requiresOnlinePayment: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return fallback;
};

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
    throw new Error(getErrorMessage(payload, `Request failed with ${response.status}`));
  }

  return (payload as ApiEnvelope<T>).data;
}

const mapProduct = (product: any): Product => ({
  id: String(product.id),
  slug: product.slug,
  name: product.name,
  price: Number(product.price || 0),
  originalPrice: product.originalPrice === undefined ? undefined : Number(product.originalPrice),
  category: product.category || '',
  categoryId: product.categoryId,
  image: product.image || product.images?.[0] || '',
  secondaryImage: product.secondaryImage,
  listImages: product.listImages || product.images,
  description: product.description,
  details: Array.isArray(product.details) ? product.details : undefined,
  composition: product.composition,
  care: product.care,
  sizes: Array.isArray(product.sizes) ? product.sizes : undefined,
  colors: Array.isArray(product.colors) ? product.colors : undefined,
  stock: product.stock,
  status: product.status
});

const mapCategory = (category: any): Category => ({
  id: String(category.id),
  name: category.name || 'Category',
  slug: category.slug || String(category.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  description: category.description || '',
  image: category.image || '',
  isActive: category.isActive !== false,
  productCount: Number(category.productCount || 0),
  sortOrder: Number(category.sortOrder || 0),
  isDynamic: Boolean(category.isDynamic),
  parent: category.parent || 'None'
});

const mapUser = (user: any): UserProfile & { id?: string; role?: string } => ({
  id: user.id,
  role: user.role,
  firstName: user.firstName || 'Story',
  lastName: user.lastName || '',
  email: user.email || '',
  phone: user.phone || '',
  language: user.language || 'ENGLISH',
  newsletter: Boolean(user.newsletter)
});

const listFromSetting = (value: unknown, fallback: string[] = []) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string') return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

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

const asBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
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

const mapStorefrontContent = (settings: any): StorefrontContent => ({
  announcementItems: listFromSetting(settings.announcement_ticker_items, [
    'FREE SHIPPING ON ORDERS ABOVE INR 999',
    'SALE 20% OFF',
    '100% AUTHENTIC BRANDED FASHION',
    'NEW ARRIVALS EVERY WEEK',
    'EASY RETURNS & EXCHANGES',
    'CURATED IN INDIA FOR YOU'
  ]),
  heroEyebrow: settings.home_hero_eyebrow || 'NEW EDITORIAL CAPSULE',
  heroTitle: settings.home_hero_title || 'OUR LATEST STORY',
  heroBody: settings.home_hero_body || 'Discover verified branded fashion, curated in India for everyday premium style.',
  heroPrimaryCta: settings.home_hero_primary_cta || 'SHOP THE DROP',
  heroSecondaryCta: settings.home_hero_secondary_cta || 'EXPLORE STYLE EDIT',
  heroImagePrimary: settings.home_hero_image_primary || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85',
  heroImageSecondary: settings.home_hero_image_secondary || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  heroImageDetail: settings.home_hero_image_detail || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
  heroImageFourth: settings.home_hero_image_fourth || '',
  heroImageFifth: settings.home_hero_image_fifth || '',
  heroImageSixth: settings.home_hero_image_sixth || '',
  heroBadgeEyebrow: settings.home_hero_badge_eyebrow || 'Story India 2026',
  heroBadgeText: settings.home_hero_badge_text || 'Tailored quiet luxury',
  productsEyebrow: settings.home_products_eyebrow || 'Seasonal selection',
  productsTitle: settings.home_products_title || 'Our Products',
  productsBody: settings.home_products_body || 'Explore curated essentials across clothing, footwear, and everyday luxury.',
  homeProductIds: listFromSetting(settings.home_products_ids, []),
  collectionEyebrow: settings.home_collection_eyebrow || 'Curated combinations',
  collectionTitle: settings.home_collection_title || 'Perfect Match',
  collectionBody: settings.home_collection_body || 'Explore curated collections designed to complement your style with comfort and confidence.',
  collectionImage: settings.home_collection_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  collectionProductIds: listFromSetting(settings.home_collection_product_ids, []),
  discoverEyebrow: settings.discover_eyebrow || 'OUR COMPLETE CODES',
  discoverTitle: settings.discover_title || 'COLLECTIONS',
  discoverSearchPlaceholder: settings.discover_search_placeholder || 'SEARCH PRODUCTS, STYLING OR RELEASES...',
  discoverTagLabel: settings.discover_tag_label || 'STYLING DIARY:',
  jewelryEyebrow: settings.home_jewelry_eyebrow || 'Accessories edit',
  jewelryTitle: settings.home_jewelry_title || 'Story Jewelry',
  jewelryBody: settings.home_jewelry_body || 'Adorn yourself with timeless accessories that complete every look.',
  recommendationEyebrow: settings.home_recommendation_eyebrow || 'Selected next',
  recommendationTitle: settings.home_recommendation_title || 'Recommendation',
  recommendationProductIds: listFromSetting(settings.home_recommendation_ids, ['linen-wide-pants', 'faux-leather-jacket', 'gray-tube-top', 'drawstring-linen-pants', 'convertible-crossbody-bag']),
  storyCategories: jsonListFromSetting(settings.story_categories, []),
  aboutEyebrow: settings.about_eyebrow || 'About STORY India',
  aboutTitle: settings.about_title || 'Verified Fashion, Curated In India',
  aboutIntroParagraph1: settings.about_intro_paragraph_1 || 'STORY is a premium India-based fashion store built for people who want original branded pieces without the noise of fast, careless shopping.',
  aboutIntroParagraph2: settings.about_intro_paragraph_2 || 'We curate verified branded fashion across uppers, lowers, dresses, co-ords, footwear, accessories, and inners, with a focus on authenticity, condition, price, and everyday Indian style.',
  aboutPrimaryCtaText: settings.about_primary_cta_text || 'Shop Verified Picks',
  aboutSecondaryCtaText: settings.about_secondary_cta_text || 'View Curated Drops',
  aboutImage1: settings.about_image_1 || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  aboutImage2: settings.about_image_2 || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  aboutImage3: settings.about_image_3 || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  aboutBadgeText: settings.about_badge_text || 'Premium branded fashion, checked, styled, and priced for modern Indian wardrobes.',
  aboutStats: jsonListFromSetting(settings.about_stats, DEFAULT_ABOUT_STATS),
  aboutValuesEyebrow: settings.about_values_eyebrow || 'Our standard',
  aboutValuesTitle: settings.about_values_title || 'Original Pieces, Clear Checks',
  aboutValues: jsonListFromSetting(settings.about_values, DEFAULT_ABOUT_VALUES),
  aboutPromiseEyebrow: settings.about_promise_eyebrow || 'The STORY promise',
  aboutPromiseTitle: settings.about_promise_title || 'Verified Authentic. Best Price. Better Quality.',
  aboutPromiseBody: settings.about_promise_body || 'From first scroll to final delivery, STORY keeps the edit focused: real branded pieces, clean product presentation, reliable support, and fashion that fits Indian everyday life.',
  aboutPromiseImage: settings.about_promise_image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
  razorpayActive: asBoolean(settings.razorpay_active, true),
  onlinePaymentEnabled: asBoolean(settings.online_payment_enabled, true),
  codEnabled: asBoolean(settings.cod_enabled, false),
  privacyPolicy: settings.privacy_policy || 'We respect your privacy and use customer information only to process orders, provide support, improve the shopping experience, and meet legal or payment requirements. We do not sell customer data. Payment information is processed securely by our payment partners.',
  termsConditions: settings.terms_conditions || 'By using STORY India, you agree to provide accurate account, delivery, and payment information. Product availability, pricing, promotions, and delivery timelines may change without prior notice. Orders are confirmed only after successful payment and verification.',
  returnRefundPolicy: settings.return_refund_policy || 'Returns or exchanges may be requested for eligible unused products within the return window shown at purchase. Items must be returned with tags, packaging, and invoice. Refunds are processed to the original payment method after quality check approval.'
});

const mapAddress = (address: any): Address => ({
  id: address.id,
  label: address.label,
  fullName: address.fullName || address.name || 'STORY Client',
  phone: address.phone || '',
  street: address.street || address.line1 || '',
  line1: address.line1,
  line2: address.line2,
  city: address.city || [address.cityName, address.state, address.pincode].filter(Boolean).join(', '),
  cityName: address.cityName,
  state: address.state,
  pincode: address.pincode,
  country: address.country || 'India',
  isDefault: Boolean(address.isDefault)
});

const mapCartItem = (item: any): CartItem => ({
  id: String(item.id),
  product: mapProduct(item.product),
  selectedSize: item.selectedSize || 'O/S',
  selectedColor: item.selectedColor || { name: item.selectedColorName || 'Black', hex: item.selectedColorHex || '#111111' },
  quantity: Number(item.quantity || 1)
});

const mapOrder = (order: any): Order => ({
  id: String(order.id),
  date: String(order.date || order.createdAt || ''),
  status: order.status,
  paymentStatus: order.paymentStatus,
  items: (order.items || []).map((item: any) => ({
    id: String(item.id),
    product: {
      id: String(item.productId || item.id),
      name: item.name,
      price: Number(item.price || 0),
      category: '',
      image: item.image || item.imageUrl || ''
    },
    selectedSize: item.selectedSize || 'O/S',
    selectedColor: item.selectedColor || { name: item.selectedColorName || 'Black', hex: item.selectedColorHex || '#111111' },
    quantity: Number(item.quantity || 1)
  })),
  subtotal: Number(order.subtotal || 0),
  shipping: Number(order.shipping || order.deliveryFee || 0),
  tax: Number(order.tax || order.gstAmount || 0),
  total: Number(order.total || 0),
  address: mapAddress(order.address || order.addressSnapshot || {}),
  paymentMethod: order.paymentMethod || 'Razorpay',
  trackingUrl: order.trackingUrl
});

const mapReview = (review: any): CustomerReview => ({
  id: review.id,
  name: review.name || 'STORY Customer',
  tag: review.tag || 'VERIFIED PURCHASE',
  rating: Number(review.rating || 5),
  review: review.review || '',
  status: review.status,
  createdAt: review.createdAt
});

const cartItemsFromResponse = (cart: any): CartItem[] => (cart.items || []).map(mapCartItem);

const toAddressPayload = (address: Address, profile: UserProfile) => ({
  label: address.label || 'Home',
  name: address.fullName || `${profile.firstName} ${profile.lastName}`.trim() || '',
  phone: address.phone || profile.phone || '',
  line1: address.line1 || address.street || '',
  line2: address.line2 || '',
  city: address.cityName || '',
  state: address.state || 'Maharashtra',
  pincode: address.pincode || '400001',
  country: address.country || 'India',
  isDefault: address.isDefault ?? true
});

export const storyApi = {
  fetchProducts: async () => {
    const data = await apiRequest<any[]>('/products?limit=100');
    return data.map(mapProduct);
  },
  categories: async () => {
    const data = await apiRequest<any[]>('/categories');
    return data.map(mapCategory);
  },
  settings: async () => mapStorefrontContent(await apiRequest('/settings')),
  createContactRequest: (payload: {
    name: string;
    email: string;
    phone?: string;
    topic: string;
    message: string;
  }) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  reviews: async () => {
    const data = await apiRequest<any[]>('/reviews');
    return data.map(mapReview);
  },
  createReview: async (payload: CustomerReview) =>
    mapReview(await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    })),
  googleConfig: async () => apiRequest<{ clientId: string }>('/auth/google/config'),
  login: async (email: string, password: string): Promise<AuthSession> => {
    const data = await apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return { user: mapUser(data.user), token: data.token };
  },
  googleLogin: async (idToken: string): Promise<AuthSession> => {
    const data = await apiRequest<{ user: any; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    return { user: mapUser(data.user), token: data.token };
  },
  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthSession> => {
    const data = await apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { user: mapUser(data.user), token: data.token };
  },
  me: async () => {
    const data = await apiRequest<{ user: any }>('/auth/me');
    return mapUser(data.user);
  },
  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => undefined);
  },
  forgotPassword: (email: string) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  getCart: async () => cartItemsFromResponse(await apiRequest('/cart')),
  addCartItem: async (productId: string, quantity: number, selectedSize: string, selectedColor: ColorOption) =>
    cartItemsFromResponse(await apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, selectedSize, selectedColor })
    })),
  updateCartItem: async (productId: string, quantity: number, selectedSize: string, selectedColorName: string) =>
    cartItemsFromResponse(await apiRequest(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, selectedSize, selectedColorName })
    })),
  removeCartItem: async (productId: string, selectedSize: string, selectedColorName: string) =>
    cartItemsFromResponse(await apiRequest(`/cart/items/${productId}?selectedSize=${encodeURIComponent(selectedSize)}&selectedColorName=${encodeURIComponent(selectedColorName)}`, {
      method: 'DELETE'
    })),
  clearCart: async () => cartItemsFromResponse(await apiRequest('/cart', { method: 'DELETE' })),
  getAddresses: async () => {
    const data = await apiRequest<any[]>('/profile/addresses');
    return data.map(mapAddress);
  },
  createAddress: async (address: Address, profile: UserProfile) => {
    const data = await apiRequest('/profile/addresses', {
      method: 'POST',
      body: JSON.stringify(toAddressPayload(address, profile))
    });
    return mapAddress(data);
  },
  updateAddress: async (address: Address, profile: UserProfile) => {
    if (!address.id) throw new Error('Address id is required.');
    const data = await apiRequest(`/profile/addresses/${address.id}`, {
      method: 'PUT',
      body: JSON.stringify(toAddressPayload(address, profile))
    });
    return mapAddress(data);
  },
  updateProfile: async (profile: UserProfile) => {
    const data = await apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        language: profile.language,
        newsletter: profile.newsletter
      })
    });
    return mapUser(data);
  },
  getOrders: async () => {
    const data = await apiRequest<any[]>('/orders?limit=50');
    return data.map(mapOrder);
  },
  createOrder: async (addressId: string, couponCode?: string, paymentMethod: 'online' | 'cod' = 'online'): Promise<CheckoutOrderResponse> => {
    const data = await apiRequest<any>('/orders', {
      method: 'POST',
      body: JSON.stringify({ addressId, couponCode, paymentMethod })
    });
    return { ...data, order: mapOrder(data.order) };
  },
  validateCoupon: async (code: string, subtotal: number): Promise<{ valid: boolean; discount?: number; message?: string }> => {
    try {
      const data = await apiRequest<{ valid: boolean; discount?: number; message?: string }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal })
      });
      return data;
    } catch (error) {
      return { valid: false, message: error instanceof Error ? error.message : 'Invalid coupon' };
    }
  },
  verifyPayment: async (payload: {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const data = await apiRequest<any>('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return mapOrder(data);
  }
};
