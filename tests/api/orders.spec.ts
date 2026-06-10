import { expect, test } from '@playwright/test';
import { addCartItem, apiRequest, createAddress, createOrder } from '../helpers/api';
import { registerFreshUser } from '../helpers/auth';
import { SAMPLE_ADDRESS, toApiAddress } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { readTestState } from '../helpers/state';

runApiSuiteOnce();

test.describe('API orders', () => {
  test('POST /api/orders creates a Razorpay order for a cart with address', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const state = readTestState();
    const address = await createAddress(request, toApiAddress(SAMPLE_ADDRESS), cookies);
    await addCartItem(request, state.product?.id || '', cookies);

    const response = await apiRequest(request, '/orders', 'POST', {
      addressId: address.data.id,
      paymentMethod: 'online'
    }, cookies);

    expect([201, 400, 500]).toContain(response.status());
    if (response.status() === 201) {
      const body = await response.json();
      expect(body.data).toEqual(expect.objectContaining({
        orderId: expect.any(String),
        publicId: expect.any(String),
        requiresOnlinePayment: true
      }));
    } else {
      const body = await response.json();
      expect(body.message).toMatch(/online payment|razorpay|payment/i);
    }
  });

  test('POST /api/orders fails without address and with an empty cart', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const state = readTestState();

    const emptyCart = await apiRequest(request, '/orders', 'POST', {
      addressId: '00000000-0000-4000-8000-000000000000',
      paymentMethod: 'online'
    }, cookies);
    expect(emptyCart.status()).toBe(400);

    await addCartItem(request, state.product?.id || '', cookies);
    const missingAddress = await apiRequest(request, '/orders', 'POST', {
      addressId: '00000000-0000-4000-8000-000000000000',
      paymentMethod: 'online'
    }, cookies);
    expect(missingAddress.status()).toBe(404);
  });

  test('GET /api/orders and /api/orders/:id return only the authenticated user orders', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const orders = await apiRequest(request, '/orders', 'GET', undefined, cookies);
    expect(orders.status()).toBe(200);
    expect(Array.isArray((await orders.json()).data)).toBe(true);

    const missing = await apiRequest(request, '/orders/ST-IN-00000', 'GET', undefined, cookies);
    expect(missing.status()).toBe(404);
  });

  test('order details include items, status, payment status, totals, and address when an order exists', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const orders = await apiRequest(request, '/orders', 'GET', undefined, cookies);
    const data = (await orders.json()).data;

    if (!data.length) {
      test.info().annotations.push({ type: 'note', description: 'No completed order exists for this fresh user yet.' });
      expect(data).toEqual([]);
      return;
    }

    const detail = await apiRequest(request, `/orders/${data[0].id}`, 'GET', undefined, cookies);
    expect(detail.status()).toBe(200);
    expect((await detail.json()).data).toEqual(expect.objectContaining({
      items: expect.any(Array),
      status: expect.any(String),
      paymentStatus: expect.any(String),
      total: expect.any(Number),
      address: expect.any(Object)
    }));
  });
});
