import { expect, test, type Page } from '@playwright/test';
import { API_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

const warmAndMeasureNavigation = async (
  page: Page,
  path: string,
  visibleSelector: string,
  budgetMs: number
) => {
  // Warm the Vite dev server once so local transforms are not counted as app load time.
  await page.goto(path);
  await expect(page.locator(visibleSelector)).toBeVisible({ timeout: 15_000 });

  const startedAt = Date.now();
  await page.reload({ waitUntil: 'load' });
  await expect(page.locator(visibleSelector)).toBeVisible({ timeout: 15_000 });
  expect(Date.now() - startedAt).toBeLessThan(budgetMs);
};

test.describe('Performance smoke tests', () => {
  test.setTimeout(60_000);
  test('homepage loads within 10 seconds', async ({ page }) => {
    await warmAndMeasureNavigation(page, '/', '#shop-view-container', 10_000);
  });

  test('product listing and product detail load within 10 seconds each', async ({ page }) => {
    await warmAndMeasureNavigation(page, '/collections', '#discover-view-container', 10_000);

    const startedAt = Date.now();
    await page.locator('[id^="discover-card-"]').first().click();
    await expect(page.locator('#product-detail-view-container')).toBeVisible();
    expect(Date.now() - startedAt).toBeLessThan(2_000);
  });

  test('core API responses return within 10 seconds', async ({ request }) => {
    for (const endpoint of ['/health', '/products?limit=5', '/categories']) {
      // Warm each endpoint once so Neon cold-start latency does not make this flaky.
      await request.get(`${API_URL}${endpoint}`);
      const startedAt = Date.now();
      const response = await request.get(`${API_URL}${endpoint}`);
      expect(response.status()).toBeLessThan(500);
      expect(Date.now() - startedAt).toBeLessThan(10_000);
    }
  });

  test('images use lazy loading where appropriate and CLS stays under 0.1', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();

    expect(await page.locator('img[loading="lazy"]').count()).toBeGreaterThan(0);

    const cls = await page.evaluate(async () => {
      let cumulativeLayoutShift = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      observer.disconnect();
      return cumulativeLayoutShift;
    });

    expect(cls).toBeLessThan(0.1);
  });
});
