import { expect, test } from '@playwright/test';
import { apiRequest } from '../helpers/api';
import { getAuthCookiesFromResponse, loginAsUserAPI, logoutUser, registerFreshUser, registerUser } from '../helpers/auth';
import { generateUniqueEmail, TEST_USER } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('API auth', () => {
  test('POST /api/auth/register creates an account with valid data', async ({ request }) => {
    const response = await registerUser(request, { email: generateUniqueEmail() });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.user).toMatchObject({ role: 'user' });
    expect(await getAuthCookiesFromResponse(response)).toContain('token=');
  });

  test('POST /api/auth/register fails with duplicate email', async ({ request }) => {
    const email = generateUniqueEmail();
    const created = await registerUser(request, { email });
    expect(created.status()).toBe(201);

    const duplicate = await registerUser(request, { email });
    expect(duplicate.status()).toBe(409);
  });

  test('POST /api/auth/register validates email, password, and required fields', async ({ request }) => {
    const invalidEmail = await registerUser(request, { email: 'not-an-email' });
    expect(invalidEmail.status()).toBe(400);

    const shortPassword = await registerUser(request, { email: generateUniqueEmail(), password: '123' });
    expect(shortPassword.status()).toBe(400);

    const missingRequired = await apiRequest(request, '/auth/register', 'POST', {
      email: generateUniqueEmail(),
      password: TEST_USER.password
    });
    expect(missingRequired.status()).toBe(400);
  });

  test('POST /api/auth/login succeeds and sets the httpOnly auth cookie', async ({ request }) => {
    const cookies = await loginAsUserAPI(request);
    expect(cookies).toContain('token=');
  });

  test('POST /api/auth/login rejects wrong password and missing account', async ({ request }) => {
    const wrongPassword = await apiRequest(request, '/auth/login', 'POST', {
      email: TEST_USER.email,
      password: 'definitely-wrong'
    });
    expect(wrongPassword.status()).toBe(401);

    const missingEmail = await apiRequest(request, '/auth/login', 'POST', {
      email: generateUniqueEmail('missing-user'),
      password: TEST_USER.password
    });
    expect(missingEmail.status()).toBe(401);
  });

  test('GET /api/auth/me returns the profile only when authenticated', async ({ request }) => {
    const cookies = await loginAsUserAPI(request);
    const authenticated = await apiRequest(request, '/auth/me', 'GET', undefined, cookies);
    expect(authenticated.status()).toBe(200);
    expect((await authenticated.json()).data.user.email).toBe(TEST_USER.email);

    const unauthenticated = await apiRequest(request, '/auth/me', 'GET', undefined, '');
    expect(unauthenticated.status()).toBe(401);
  });

  test('POST /api/auth/logout clears a valid session and rejects anonymous logout', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const logout = await logoutUser(request, cookies);
    expect(logout.status()).toBe(200);

    const anonymous = await logoutUser(request);
    expect(anonymous.status()).toBe(401);
  });

  test('POST /api/auth/forgot-password returns a safe response for existing and missing emails', async ({ request }) => {
    const existing = await apiRequest(request, '/auth/forgot-password', 'POST', { email: TEST_USER.email });
    expect(existing.status()).toBe(200);

    const missing = await apiRequest(request, '/auth/forgot-password', 'POST', { email: generateUniqueEmail('forgot') });
    expect(missing.status()).toBe(200);
  });
});
