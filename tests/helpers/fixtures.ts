export const API_URL = process.env.API_URL || 'http://localhost:5000/api';
export const STORE_URL = process.env.STORE_URL || 'http://localhost:3000';
export const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001';

const runId = process.env.TEST_RUN_ID || `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@storyindia.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
  firstName: 'Story',
  lastName: 'Tester',
  phone: '+919876543210'
};

export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@storyindia.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!'
};

export const SAMPLE_CATEGORY = {
  name: `E2E Category ${runId}`,
  description: 'Automated Playwright category for STORY India tests.',
  imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
  isActive: true,
  sortOrder: 1
};

export const SAMPLE_PRODUCT = {
  name: `E2E Linen Shirt ${runId}`,
  sku: `STORY-E2E-${runId}`,
  price: 1299,
  stock: 8,
  category: SAMPLE_CATEGORY.name,
  description: 'Automated Playwright product used by checkout and cart tests.',
  images: [
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85'
  ],
  secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  sizes: ['S', 'M', 'L'],
  colors: [{ name: 'Black', hex: '#111111' }]
};

export const SAMPLE_COUPON = {
  code: `E2E${String(runId).replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase()}`,
  discountText: '10% Off',
  discountPercent: 10,
  type: 'percentage',
  value: 10,
  minOrderValue: 0,
  usageLimit: 50,
  isActive: true,
  expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
};

export const SAMPLE_ADDRESS = {
  fullName: 'Story Test Client',
  street: '12 Kala Ghoda Lane',
  line1: '12 Kala Ghoda Lane',
  line2: 'Near Museum',
  city: 'Mumbai',
  cityName: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  country: 'India',
  phone: '+919876543210',
  label: 'Home',
  isDefault: true
};

export function generateUniqueEmail(prefix = 'story-e2e') {
  return `${prefix}+${Date.now()}-${Math.floor(Math.random() * 100_000)}@storyindia.test`;
}

export function generateRandomSKU(prefix = 'STORY-E2E') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

export function toApiAddress(address = SAMPLE_ADDRESS) {
  return {
    label: address.label,
    name: address.fullName,
    phone: address.phone,
    line1: address.line1 || address.street,
    line2: address.line2,
    city: address.cityName || address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    isDefault: address.isDefault
  };
}
