import { expect, type APIRequestContext, type APIResponse, type Page } from '@playwright/test';
import { API_URL, TEST_USER } from './fixtures';
import { generateUniqueEmail } from './fixtures';

type UserCredentials = typeof TEST_USER;

function cookieHeaderFromSetCookie(setCookieHeaders: string[]) {
  return setCookieHeaders
    .map((cookie) => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ');
}

export function cookieValue(cookies: string, name: string) {
  return cookies
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function getAuthCookiesFromResponse(response: APIResponse) {
  const headers = await response.headersArray();
  return cookieHeaderFromSetCookie(
    headers.filter((header) => header.name.toLowerCase() === 'set-cookie').map((header) => header.value)
  );
}

export async function loginAsUser(page: Page, user: UserCredentials = TEST_USER) {
  await page.goto('/account');
  await page.locator('#email-input').fill(user.email);
  await page.locator('#pass-input').fill(user.password);
  const loginResponse = page.waitForResponse((response) =>
    response.url().includes('/api/auth/login') && response.request().method() === 'POST'
  );
  await page.locator('#signin-interactive-form button[type="submit"]').click();
  await expect((await loginResponse).ok()).toBeTruthy();
  await expect(page.locator('#login-view-root')).toBeHidden({ timeout: 10_000 });
}

export async function loginAsUserAPI(request: APIRequestContext, user: UserCredentials = TEST_USER) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: user.email,
      password: user.password
    }
  });
  expect(response.status(), await response.text()).toBe(200);
  return getAuthCookiesFromResponse(response);
}

export async function loginAsAdminAPI(
  request: APIRequestContext,
  admin = { email: process.env.TEST_ADMIN_EMAIL || 'admin@storyindia.com', password: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!' }
) {
  const response = await request.post(`${API_URL}/auth/admin/login`, {
    data: admin
  });
  expect(response.status(), await response.text()).toBe(200);
  return getAuthCookiesFromResponse(response);
}

export async function registerUser(request: APIRequestContext, userData: Partial<UserCredentials> = {}) {
  return request.post(`${API_URL}/auth/register`, {
    data: {
      ...TEST_USER,
      ...userData
    },
    timeout: 30_000
  });
}

export async function registerFreshUser(request: APIRequestContext, userData: Partial<UserCredentials> = {}) {
  const user = {
    ...TEST_USER,
    email: generateUniqueEmail(),
    ...userData
  };
  const response = await registerUser(request, user);
  expect(response.status(), await response.text()).toBe(201);
  return {
    user,
    cookies: await getAuthCookiesFromResponse(response)
  };
}

export async function getAuthCookies(request: APIRequestContext) {
  return loginAsUserAPI(request);
}

export async function logoutUser(request: APIRequestContext, cookies?: string) {
  return request.post(`${API_URL}/auth/logout`, {
    headers: cookies ? { Cookie: cookies } : undefined
  });
}
