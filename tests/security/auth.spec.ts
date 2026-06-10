import { expect, test } from '@playwright/test';
import { apiRequest } from '../helpers/api';
import { loginAsUserAPI } from '../helpers/auth';
import { API_URL, TEST_USER } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('Security auth controls', () => {
  test('protected user and admin endpoints reject missing or insufficient auth', async ({ request }) => {
    expect((await apiRequest(request, '/profile')).status()).toBe(401);
    expect((await apiRequest(request, '/cart')).status()).toBe(401);
    expect((await apiRequest(request, '/admin/products')).status()).toBe(401);

    const userCookies = await loginAsUserAPI(request);
    const adminAsUser = await apiRequest(request, '/admin/products', 'GET', undefined, userCookies);
    expect([401, 403]).toContain(adminAsUser.status());
  });

  test('tampered JWT cookie is rejected as invalid or expired', async ({ request }) => {
    const response = await apiRequest(request, '/auth/me', 'GET', undefined, 'token=not-a-valid-jwt');
    expect(response.status()).toBe(401);
  });

  test('CORS does not allow unauthorized origins', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`, {
      headers: { Origin: 'https://attacker.example' }
    });
    expect(response.headers()['access-control-allow-origin']).not.toBe('https://attacker.example');
  });

  test('search parameters handle XSS and SQL injection payloads without server errors', async ({ request }) => {
    const xss = await apiRequest(request, '/products?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(xss.status()).toBe(200);
    expect(await xss.text()).not.toContain('<script>');

    const sql = await apiRequest(request, "/products?search=' OR 1=1 --");
    expect(sql.status()).toBe(200);
    expect((await sql.json()).success).toBe(true);
  });

  test('rate limiting can be exercised explicitly without disrupting the default suite', async ({ request }) => {
    test.skip(!process.env.RUN_RATE_LIMIT_TESTS, 'Set RUN_RATE_LIMIT_TESTS=1 to run the disruptive 429 threshold check.');

    let lastStatus = 0;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const response = await apiRequest(request, '/auth/login', 'POST', {
        email: TEST_USER.email,
        password: `wrong-${attempt}`
      });
      lastStatus = response.status();
      if (lastStatus === 429) break;
    }
    expect(lastStatus).toBe(429);
  });
});
