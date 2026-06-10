import { expect, test } from '@playwright/test';

test.describe('Cross-browser visual consistency', () => {
  const pages = [
    { name: 'homepage', path: '/', selector: '#shop-view-container' },
    { name: 'collections', path: '/collections', selector: '#discover-view-container' },
    { name: 'about', path: '/about', selector: '#about-view-container' },
    { name: 'contact', path: '/contact', selector: '#contact-view-container' },
    { name: 'login', path: '/account', selector: '#login-view-root' },
  ];

  for (const { name, path, selector } of pages) {
    test(`${name} renders correctly`, async ({ page, browserName }) => {
      await page.goto(path);
      await expect(page.locator(selector)).toBeVisible({ timeout: 15_000 });
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`cross-browser-${name}-${browserName}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.08, // Allow 8% diff across browsers
      });
    });
  }

  test('navbar looks consistent', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('#global-navbar')).toBeVisible();
    await expect(page.locator('#global-navbar')).toHaveScreenshot(
      `cross-browser-navbar-${browserName}.png`,
      { maxDiffPixelRatio: 0.05 }
    );
  });

  test('product card renders correctly', async ({ page, browserName }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    const card = page.locator('[id^="discover-card-"]').first();
    if (await card.count() === 0) {
      test.skip(true, 'No product cards found');
      return;
    }
    await expect(card).toHaveScreenshot(
      `cross-browser-product-card-${browserName}.png`,
      { maxDiffPixelRatio: 0.08 }
    );
  });

  test('footer renders correctly', async ({ page, browserName }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toHaveScreenshot(
      `cross-browser-footer-${browserName}.png`,
      { maxDiffPixelRatio: 0.08 }
    );
  });
});
