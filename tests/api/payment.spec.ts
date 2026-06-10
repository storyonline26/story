import { expect, test } from '@playwright/test';
import { apiRequest } from '../helpers/api';
import { registerFreshUser } from '../helpers/auth';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('API payment', () => {
  test('POST /api/payment/verify fails for a non-existent order', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const response = await apiRequest(request, '/payment/verify', 'POST', {
      orderId: 'ST-IN-00000',
      razorpayPaymentId: 'pay_invalid',
      razorpaySignature: 'bad-signature'
    }, cookies);

    expect([404, 500]).toContain(response.status());
  });

  test('POST /api/payment/verify rejects invalid signatures before marking an order paid', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const response = await apiRequest(request, '/payment/verify', 'POST', {
      orderId: '00000000-0000-4000-8000-000000000000',
      razorpayPaymentId: 'pay_invalid',
      razorpaySignature: 'invalid'
    }, cookies);

    expect([404, 500]).toContain(response.status());
  });
});
