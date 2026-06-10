import { expect, test } from '@playwright/test';
import { apiRequest, createCategory, getCategories } from '../helpers/api';
import { loginAsAdminAPI } from '../helpers/auth';
import { SAMPLE_CATEGORY } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { readTestState } from '../helpers/state';

runApiSuiteOnce();

test.describe('API categories', () => {
  test('GET /api/categories returns active categories with product counts', async ({ request }) => {
    const categories = await getCategories(request);
    expect(categories.success).toBe(true);
    expect(Array.isArray(categories.data)).toBe(true);
    expect(categories.data[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.anything(),
      image: expect.anything(),
      productCount: expect.any(Number)
    }));
  });

  test('public categories exclude inactive categories', async ({ request }) => {
    const adminCookies = await loginAsAdminAPI(request);
    const created = await createCategory(request, {
      ...SAMPLE_CATEGORY,
      name: `E2E Inactive Category ${Date.now()}`,
      isActive: false
    }, adminCookies);

    const publicCategories = await getCategories(request);
    expect(publicCategories.data.some((category: { id: string }) => category.id === created.data.id)).toBe(false);
  });

  test('categories include correct product counts for seeded test data', async ({ request }) => {
    const state = readTestState();
    const category = await apiRequest(request, `/categories/${state.category?.slug}`);
    expect(category.status()).toBe(200);
    const body = await category.json();
    expect(body.data.productCount).toBeGreaterThanOrEqual(1);
    expect(body.data.products.some((product: { id: string }) => product.id === state.product?.id)).toBe(true);
  });
});
