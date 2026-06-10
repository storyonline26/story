import { request as playwrightRequest } from '@playwright/test';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { API_URL, SAMPLE_CATEGORY, SAMPLE_COUPON, SAMPLE_PRODUCT, TEST_ADMIN, TEST_USER } from './helpers/fixtures';
import { createCategory, createCoupon, createProduct } from './helpers/api';
import { getAuthCookiesFromResponse } from './helpers/auth';
import { cleanupTestData, getPrisma } from './helpers/db';
import { ADMIN_AUTH_STATE, ensureAuthDir, TEST_STATE_FILE, USER_AUTH_STATE, writeTestState, type TestState } from './helpers/state';

dotenv.config({ path: '.env.test' });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

async function waitForBackend() {
  const healthUrl = `${API_URL}/health`;
  const deadline = Date.now() + 90_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The Playwright webServer process may still be booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Backend did not become healthy at ${healthUrl}`);
}

async function ensureUser(api: Awaited<ReturnType<typeof playwrightRequest.newContext>>) {
  const register = await api.post(`${API_URL}/auth/register`, { data: TEST_USER });
  if (register.status() !== 201 && register.status() !== 409) {
    throw new Error(`Could not create test user: ${register.status()} ${await register.text()}`);
  }

  const login = await api.post(`${API_URL}/auth/login`, {
    data: {
      email: TEST_USER.email,
      password: TEST_USER.password
    }
  });
  if (!login.ok()) throw new Error(`Could not login test user: ${login.status()} ${await login.text()}`);
  await api.storageState({ path: USER_AUTH_STATE });
  return (await login.json()).data.user as { id: string; email: string };
}

async function ensureAdminUser() {
  const prisma = await getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: TEST_ADMIN.email.toLowerCase() } });
  const passwordHash = await bcrypt.hash(TEST_ADMIN.password, 12);

  const admin = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: existing.firstName || 'Story',
          lastName: existing.lastName || 'Admin',
          passwordHash,
          role: 'admin',
          isActive: true
        }
      })
    : await prisma.user.create({
        data: {
          firstName: 'Story',
          lastName: 'Admin',
          email: TEST_ADMIN.email.toLowerCase(),
          phone: '+919876543211',
          passwordHash,
          role: 'admin'
        }
      });

  return { user: admin, createdBySetup: !existing };
}

async function enablePaymentSettingsForTests() {
  const prisma = await getPrisma();
  const keys = ['online_payment_enabled', 'razorpay_active'];
  const existing = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const originalSettings = keys.map((key) => ({
    key,
    value: existing.find((setting: { key: string; value: string }) => setting.key === key)?.value ?? null
  }));

  for (const key of keys) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: 'true' },
      create: { key, value: 'true' }
    });
  }

  return originalSettings;
}

export default async function globalSetup() {
  ensureAuthDir();
  await waitForBackend();

  const api = await playwrightRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: {
      Origin: process.env.STORE_URL || 'http://localhost:3000'
    }
  });

  await cleanupTestData();
  const user = await ensureUser(api);
  const { user: admin, createdBySetup } = await ensureAdminUser();
  const originalSettings = await enablePaymentSettingsForTests();

  const adminLogin = await api.post(`${API_URL}/auth/admin/login`, {
    data: {
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password
    }
  });
  if (!adminLogin.ok()) throw new Error(`Could not login test admin: ${adminLogin.status()} ${await adminLogin.text()}`);
  const adminCookies = await getAuthCookiesFromResponse(adminLogin);
  await api.storageState({ path: ADMIN_AUTH_STATE });

  const adminContext = await playwrightRequest.newContext({
    baseURL: API_URL,
    storageState: ADMIN_AUTH_STATE
  });

  const categoryEnvelope = await createCategory(adminContext, SAMPLE_CATEGORY, adminCookies);
  if (!categoryEnvelope.success) throw new Error(`Could not create setup category: ${JSON.stringify(categoryEnvelope)}`);
  const category = categoryEnvelope.data;
  const productEnvelope = await createProduct(
    adminContext,
    {
      ...SAMPLE_PRODUCT,
      categoryId: category.id,
      images: SAMPLE_PRODUCT.images,
      sizes: SAMPLE_PRODUCT.sizes,
      colors: SAMPLE_PRODUCT.colors
    },
    adminCookies
  );
  if (!productEnvelope.success) throw new Error(`Could not create setup product: ${JSON.stringify(productEnvelope)}`);
  const product = productEnvelope.data;
  const couponEnvelope = await createCoupon(adminContext, SAMPLE_COUPON, adminCookies);
  if (!couponEnvelope.success) throw new Error(`Could not create setup coupon: ${JSON.stringify(couponEnvelope)}`);
  const coupon = couponEnvelope.data;

  const state: TestState = {
    runId: `${Date.now()}`,
    user: { id: user.id, email: user.email },
    admin: { id: admin.id, email: admin.email, createdBySetup },
    category: { id: category.id, slug: category.slug, name: category.name },
    product: { id: product.id, slug: product.slug, name: product.name, sku: product.sku },
    coupon: { id: coupon.id, code: coupon.code },
    settings: originalSettings
  };

  writeTestState(state);
  await adminContext.dispose();
  await api.dispose();

  if (!TEST_STATE_FILE) throw new Error('Test state path was not created.');
}
