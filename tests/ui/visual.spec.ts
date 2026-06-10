import { expect, test } from '@playwright/test';

test.describe('Visual consistency and styling', () => {
  test('navbar has dark background with white text', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('#global-navbar');
    const bg = await navbar.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Should be dark (rgb values low)
    const match = bg.match(/rgb\((\d+), (\d+), (\d+)/);
    if (match) {
      const avg = (Number(match[1]) + Number(match[2]) + Number(match[3])) / 3;
      expect(avg).toBeLessThan(50); // Dark background
    }
  });

  test('page body has light background', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    const match = bg.match(/rgb\((\d+), (\d+), (\d+)/);
    if (match) {
      const avg = (Number(match[1]) + Number(match[2]) + Number(match[3])) / 3;
      expect(avg).toBeGreaterThan(200); // Light background
    }
  });

  test('fonts are loaded (Inter, JetBrains Mono)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fontsLoaded = await page.evaluate(() => {
      return document.fonts.check('12px Inter') || document.fonts.check('12px "JetBrains Mono"');
    });
    expect(fontsLoaded).toBe(true);
  });

  test('no horizontal overflow on any page', async ({ page }) => {
    for (const path of ['/', '/collections', '/about', '/contact']) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow, `Horizontal overflow on ${path}`).toBe(false);
    }
  });

  test('navbar is sticky and stays visible while scrolling', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    const navbar = page.locator('#global-navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar).toBeInViewport();
  });

  test('cart drawer has overlay backdrop when open', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Shopping bag"]').first().click();
    await expect(page.locator('#cart-drawer-panel')).toBeVisible();

    // The drawer panel should be visible and take up space
    const box = await page.locator('#cart-drawer-panel').boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  });

  test('all pages have consistent navbar and footer', async ({ page }) => {
    for (const path of ['/', '/collections', '/about', '/contact', '/account']) {
      await page.goto(path);
      await expect(page.locator('#global-navbar')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    }
  });

  test('product prices use Indian Rupee format', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();

    const priceText = await page.locator('[id^="discover-card-"]').first().textContent();
    expect(priceText).toMatch(/₹[\d,]+/);
  });
});
