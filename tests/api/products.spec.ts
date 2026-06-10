import { expect, test } from '@playwright/test';
import { apiRequest, createProduct, getProducts } from '../helpers/api';
import { loginAsAdminAPI } from '../helpers/auth';
import { generateRandomSKU, SAMPLE_PRODUCT } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { readTestState } from '../helpers/state';

runApiSuiteOnce();

test.describe('API products', () => {
  test('GET /api/products returns products with the public storefront structure', async ({ request }) => {
    const response = await getProducts(request);
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      image: expect.any(String),
      category: expect.any(String),
      stock: expect.any(Number)
    }));
  });

  test('GET /api/products respects limit, category, and search query parameters', async ({ request }) => {
    const state = readTestState();

    const limited = await apiRequest(request, '/products?limit=5');
    expect(limited.status()).toBe(200);
    expect((await limited.json()).data.length).toBeLessThanOrEqual(5);

    const byCategory = await apiRequest(request, `/products?category=${state.category?.slug}`);
    expect(byCategory.status()).toBe(200);
    const categoryData = (await byCategory.json()).data;
    expect(categoryData.some((product: { id: string }) => product.id === state.product?.id)).toBe(true);

    const bySearch = await apiRequest(request, `/products?search=${encodeURIComponent(state.product?.name || SAMPLE_PRODUCT.name)}`);
    expect(bySearch.status()).toBe(200);
    expect((await bySearch.json()).data.some((product: { id: string }) => product.id === state.product?.id)).toBe(true);
  });

  test('GET /api/products/:slug returns one product and 404s for a missing product', async ({ request }) => {
    const state = readTestState();
    const found = await apiRequest(request, `/products/${state.product?.slug}`);
    expect(found.status()).toBe(200);
    expect((await found.json()).data).toMatchObject({
      id: state.product?.id,
      name: state.product?.name
    });

    const missing = await apiRequest(request, '/products/not-a-real-story-product');
    expect(missing.status()).toBe(404);
  });

  test('products with stock 0 are exposed as out of stock', async ({ request }) => {
    const state = readTestState();
    const adminCookies = await loginAsAdminAPI(request);
    const created = await createProduct(request, {
      ...SAMPLE_PRODUCT,
      name: `E2E Out Of Stock ${Date.now()}`,
      sku: generateRandomSKU(),
      categoryId: state.category?.id,
      stock: 0
    }, adminCookies);

    const product = (await (await apiRequest(request, `/products/${created.data.slug}`)).json()).data;
    expect(product.stock).toBe(0);
  });
});
