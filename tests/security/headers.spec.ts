import { expect, test } from '@playwright/test';
import { apiRequest } from '../helpers/api';
import { getAuthCookiesFromResponse } from '../helpers/auth';
import { API_URL, TEST_USER } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('Security headers and cookies', () => {
  test('API responses include baseline Helmet security headers', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy();
    expect(headers['strict-transport-security']).toBeTruthy();
  });

  test('response headers do not expose sensitive implementation secrets', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    const serialized = JSON.stringify(response.headers()).toLowerCase();

    expect(serialized).not.toContain('jwt_secret');
    expect(serialized).not.toContain('razorpay_key_secret');
    expect(serialized).not.toContain('database_url');
  });

  test('auth cookies use httpOnly and sameSite flags, with secure required in HTTPS production', async ({ request }) => {
    const response = await apiRequest(request, '/auth/login', 'POST', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    expect(response.status()).toBe(200);

    const cookies = (await response.headersArray())
      .filter((header) => header.name.toLowerCase() === 'set-cookie')
      .map((header) => header.value);
    expect(cookies.join(';')).toContain('HttpOnly');
    expect(cookies.join(';')).toMatch(/SameSite=Lax|SameSite=None/i);

    if (API_URL.startsWith('https://')) {
      expect(cookies.join(';')).toContain('Secure');
    }

    expect(await getAuthCookiesFromResponse(response)).toContain('token=');
  });
});
