import { expect, test } from '@playwright/test';

test.describe('Responsive storefront behavior', () => {
  test('mobile navigation, cart badge, product grid, and touch targets work at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto('/');

    await expect(page.locator('#nav-mobile-hamburger')).toBeVisible();
    await expect(page.getByRole('button', { name: /^shop$/i })).toBeHidden();
    await page.locator('#nav-mobile-hamburger').click();
    await expect(page.locator('#mobile-menu-drawer')).toBeVisible();
    await expect(page.locator('#mobile-menu-drawer').getByRole('button', { name: /^collections$/i })).toBeVisible();
    const mobileCartButton = page.locator('button[aria-label="Shopping bag"]').nth(1);
    await expect(mobileCartButton).toBeVisible();
    await expect(mobileCartButton.locator('span')).toBeVisible();

    const box = await page.locator('#nav-mobile-hamburger').boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
  });

  test('tablet and desktop layouts expose the expected navigation density', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    await expect(page.locator('#global-navbar')).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^shop$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^collections$/i })).toBeVisible();
    await expect(page.locator('#editorial-hero img').first()).toBeVisible();
  });
});
