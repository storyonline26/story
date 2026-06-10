import { expect, test } from '@playwright/test';
import { addCartItem, apiRequest, clearCart } from '../helpers/api';
import { registerFreshUser } from '../helpers/auth';
import { runApiSuiteOnce } from '../helpers/project';
import { readTestState } from '../helpers/state';

runApiSuiteOnce();

test.describe('API cart', () => {
  let cookies: string;
  let productId: string;

  test.beforeEach(async ({ request }) => {
    cookies = (await registerFreshUser(request)).cookies;
    productId = readTestState().product?.id || '';
    await clearCart(request, cookies);
  });

  test('GET /api/cart returns an empty cart for a new user', async ({ request }) => {
    const response = await apiRequest(request, '/cart', 'GET', undefined, cookies);
    expect(response.status()).toBe(200);
    expect((await response.json()).data).toMatchObject({ items: [], subtotal: 0, itemCount: 0 });
  });

  test('POST /api/cart/items adds items and merges same size/color quantities', async ({ request }) => {
    let cart = await addCartItem(request, productId, cookies, { quantity: 1 });
    expect(cart.data.items).toHaveLength(1);
    expect(cart.data.items[0].quantity).toBe(1);

    cart = await addCartItem(request, productId, cookies, { quantity: 2 });
    expect(cart.data.items).toHaveLength(1);
    expect(cart.data.items[0].quantity).toBe(3);
  });

  test('POST /api/cart/items creates a separate entry for a different selected size', async ({ request }) => {
    await addCartItem(request, productId, cookies, { selectedSize: 'S' });
    const cart = await addCartItem(request, productId, cookies, { selectedSize: 'L' });

    expect(cart.data.items).toHaveLength(2);
  });

  test('PUT and DELETE /api/cart/items/:productId update and remove cart items', async ({ request }) => {
    await addCartItem(request, productId, cookies, { selectedSize: 'M' });

    const updated = await apiRequest(request, `/cart/items/${productId}`, 'PUT', {
      quantity: 2,
      selectedSize: 'M',
      selectedColorName: 'Black'
    }, cookies);
    expect(updated.status()).toBe(200);
    expect((await updated.json()).data.items[0].quantity).toBe(2);

    const removed = await apiRequest(request, `/cart/items/${productId}?selectedSize=M&selectedColorName=Black`, 'DELETE', undefined, cookies);
    expect(removed.status()).toBe(200);
    expect((await removed.json()).data.items).toHaveLength(0);
  });

  test('PUT /api/cart/items/:productId rejects zero or negative quantity', async ({ request }) => {
    await addCartItem(request, productId, cookies);
    const response = await apiRequest(request, `/cart/items/${productId}`, 'PUT', {
      quantity: 0,
      selectedSize: 'M',
      selectedColorName: 'Black'
    }, cookies);
    expect(response.status()).toBe(400);
  });

  test('all cart endpoints reject missing auth', async ({ request }) => {
    expect((await apiRequest(request, '/cart', 'GET', undefined, '')).status()).toBe(401);
    expect((await apiRequest(request, '/cart/items', 'POST', { productId }, '')).status()).toBe(401);
    expect((await apiRequest(request, `/cart/items/${productId}`, 'PUT', { quantity: 1 }, '')).status()).toBe(401);
    expect((await apiRequest(request, `/cart/items/${productId}`, 'DELETE', undefined, '')).status()).toBe(401);
  });
});
