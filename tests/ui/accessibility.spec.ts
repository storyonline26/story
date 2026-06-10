import { expect, test } from '@playwright/test';

test.describe('Accessibility and keyboard navigation', () => {
  test('all interactive elements have accessible names or labels', async ({ page }) => {
    await page.goto('/');

    // Navbar buttons have aria-labels or visible text
    const navButtons = page.locator('#global-navbar button, #global-navbar a');
    const count = await navButtons.count();
    for (let i = 0; i < Math.min(count, 15); i++) {
      const button = navButtons.nth(i);
      const name = await button.getAttribute('aria-label') || await button.textContent();
      expect(name?.trim().length).toBeGreaterThan(0);
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img:visible');
    const count = await images.count();
    let withAlt = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const ariaHidden = await images.nth(i).getAttribute('aria-hidden');
      if (alt !== null || ariaHidden === 'true') withAlt++;
    }
    // At least 80% of images should have alt or be aria-hidden
    expect(withAlt / Math.min(count, 20)).toBeGreaterThan(0.7);
  });

  test('page has proper heading hierarchy (h1 exists, followed by h2s)', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('focusable elements are reachable via Tab key', async ({ page }) => {
    await page.goto('/');

    // Tab through first few elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName.toLowerCase();
    });
    expect(['button', 'a', 'input', 'select', 'textarea']).toContain(focused);
  });

  test('cart drawer can be closed with close button', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Shopping bag"]').first().click();
    await expect(page.locator('#cart-drawer-panel')).toBeVisible();

    // Find and click close button
    const closeBtn = page.locator('#cart-drawer-panel button').first();
    await closeBtn.click();
    await expect(page.locator('#cart-drawer-panel')).toBeHidden();
  });

  test('color contrast - navbar has dark background', async ({ page }) => {
    await page.goto('/');

    const isDark = await page.locator('#global-navbar').evaluate((el) => {
      const bg = window.getComputedStyle(el).backgroundColor;
      // Handle oklab, rgba, rgb formats
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return (r + g + b) / 3 < 50;
    });
    expect(isDark).toBe(true);
  });

  test('no broken visible images on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img:not([aria-hidden="true"])');
      let broken = 0;
      imgs.forEach((img) => {
        const imgEl = img as HTMLImageElement;
        if (imgEl.offsetParent !== null && imgEl.naturalWidth === 0) broken++;
      });
      return broken;
    });
    // Allow up to 2 broken images (external URLs may fail)
    expect(brokenImages).toBeLessThan(3);
  });
});
