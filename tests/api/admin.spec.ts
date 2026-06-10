import { expect, test } from '@playwright/test';
import { apiRequest, createCategory, createCoupon, createProduct } from '../helpers/api';
import { loginAsAdminAPI, registerFreshUser } from '../helpers/auth';
import { generateRandomSKU, SAMPLE_CATEGORY, SAMPLE_COUPON, SAMPLE_PRODUCT } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { readTestState } from '../helpers/state';

runApiSuiteOnce();

test.describe('API admin', () => {
  let adminCookies: string;

  test.beforeEach(async ({ request }) => {
    adminCookies = await loginAsAdminAPI(request);
  });

  test('admin endpoints return 401/403 for anonymous and regular users', async ({ request }) => {
    const anonymous = await apiRequest(request, '/admin/products', 'GET', undefined, '');
    expect(anonymous.status()).toBe(401);

    const { cookies } = await registerFreshUser(request);
    const regularUser = await apiRequest(request, '/admin/products', 'GET', undefined, cookies);
    expect([401, 403]).toContain(regularUser.status());
  });

  test('product admin endpoints list, create, update, and delete products', async ({ request }) => {
    const state = readTestState();
    expect((await apiRequest(request, '/admin/products', 'GET', undefined, adminCookies)).status()).toBe(200);

    const created = await createProduct(request, {
      ...SAMPLE_PRODUCT,
      name: `E2E Admin Product ${Date.now()}`,
      sku: generateRandomSKU(),
      categoryId: state.category?.id
    }, adminCookies);
    expect(created.data.id).toEqual(expect.any(String));

    const updated = await apiRequest(request, `/admin/products/${created.data.id}`, 'PUT', {
      name: `${created.data.name} Updated`,
      price: 1499,
      stock: 3
    }, adminCookies);
    expect(updated.status()).toBe(200);

    const deleted = await apiRequest(request, `/admin/products/${created.data.id}`, 'DELETE', undefined, adminCookies);
    expect(deleted.status()).toBe(200);
  });

  test('order, category, coupon, customer, and dashboard admin endpoints are accessible', async ({ request }) => {
    expect((await apiRequest(request, '/admin/orders', 'GET', undefined, adminCookies)).status()).toBe(200);
    expect((await apiRequest(request, '/admin/users', 'GET', undefined, adminCookies)).status()).toBe(200);
    expect((await apiRequest(request, '/admin/dashboard/stats', 'GET', undefined, adminCookies)).status()).toBe(200);

    const category = await createCategory(request, {
      ...SAMPLE_CATEGORY,
      name: `E2E Admin Category ${Date.now()}`
    }, adminCookies);
    expect(category.data.id).toEqual(expect.any(String));

    const updatedCategory = await apiRequest(request, `/admin/categories/${category.data.id}`, 'PUT', {
      description: 'Updated category description'
    }, adminCookies);
    expect(updatedCategory.status()).toBe(200);

    const deletedCategory = await apiRequest(request, `/admin/categories/${category.data.id}`, 'DELETE', undefined, adminCookies);
    expect(deletedCategory.status()).toBe(200);

    const coupon = await createCoupon(request, {
      ...SAMPLE_COUPON,
      code: `E2EADM${Date.now().toString().slice(-6)}`
    }, adminCookies);
    expect(coupon.data.id).toEqual(expect.any(String));

    const deletedCoupon = await apiRequest(request, `/admin/coupons/${coupon.data.id}`, 'DELETE', undefined, adminCookies);
    expect(deletedCoupon.status()).toBe(200);
  });
});
