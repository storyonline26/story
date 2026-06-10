import type { APIRequestContext } from '@playwright/test';
import { API_URL } from './fixtures';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const jsonHeaders = (cookies?: string) => ({
  ...(cookies !== undefined ? { Cookie: cookies } : {}),
  'Content-Type': 'application/json'
});

export async function apiRequest(
  request: APIRequestContext,
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  cookies?: string
) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const options = {
    headers: jsonHeaders(cookies),
    data: body
  };

  if (method === 'GET') return request.get(url, { headers: jsonHeaders(cookies) });
  if (method === 'POST') return request.post(url, options);
  if (method === 'PUT') return request.put(url, options);
  if (method === 'PATCH') return request.patch(url, options);
  return request.delete(url, { headers: jsonHeaders(cookies), data: body });
}

export async function createCategory(request: APIRequestContext, categoryData: Record<string, unknown>, cookies: string) {
  const response = await apiRequest(request, '/admin/categories', 'POST', categoryData, cookies);
  return response.json();
}

export async function createProduct(request: APIRequestContext, productData: Record<string, unknown>, cookies: string) {
  const response = await apiRequest(request, '/admin/products', 'POST', productData, cookies);
  return response.json();
}

export async function createCoupon(request: APIRequestContext, couponData: Record<string, unknown>, cookies: string) {
  const response = await apiRequest(request, '/admin/coupons', 'POST', couponData, cookies);
  return response.json();
}

export async function createAddress(request: APIRequestContext, addressData: Record<string, unknown>, cookies: string) {
  const response = await apiRequest(request, '/profile/addresses', 'POST', addressData, cookies);
  return response.json();
}

export async function clearCart(request: APIRequestContext, cookies: string) {
  const response = await apiRequest(request, '/cart', 'DELETE', undefined, cookies);
  return response.json();
}

export async function addCartItem(
  request: APIRequestContext,
  productId: string,
  cookies: string,
  options: { quantity?: number; selectedSize?: string; selectedColor?: { name: string; hex: string } } = {}
) {
  const response = await apiRequest(
    request,
    '/cart/items',
    'POST',
    {
      productId,
      quantity: options.quantity ?? 1,
      selectedSize: options.selectedSize ?? 'M',
      selectedColor: options.selectedColor ?? { name: 'Black', hex: '#111111' }
    },
    cookies
  );
  return response.json();
}

export async function createOrder(request: APIRequestContext, addressId: string, cookies: string, couponCode?: string) {
  const response = await apiRequest(
    request,
    '/orders',
    'POST',
    {
      addressId,
      couponCode,
      paymentMethod: 'online'
    },
    cookies
  );
  return response.json();
}

export async function getProducts(request: APIRequestContext) {
  const response = await apiRequest(request, '/products?limit=100');
  return response.json();
}

export async function getCategories(request: APIRequestContext) {
  const response = await apiRequest(request, '/categories');
  return response.json();
}
