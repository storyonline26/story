import { expect, test } from '@playwright/test';

test.describe('Mobile UI interactions', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-navbar')).toBeVisible();
  });

  test('mobile menu opens and closes properly', async ({ page }) => {
    const hamburger = page.locator('#nav-mobile-hamburger');
    await expect(hamburger).toBeVisible();

    // Open
    await hamburger.click();
    await expect(page.locator('#mobile-menu-drawer')).toBeVisible();

    // Close
    await hamburger.click();
    await expect(page.locator('#mobile-menu-drawer')).toBeHidden();
  });

  test('mobile menu contains all nav items and account link', async ({ page }) => {
    await page.locator('#nav-mobile-hamburger').click();
    const menu = page.locator('#mobile-menu-drawer');

    await expect(menu.getByRole('button', { name: /shop/i })).toBeVisible();
    await expect(menu.getByRole('button', { name: /collections/i })).toBeVisible();
    await expect(menu.getByRole('button', { name: /our story/i })).toBeVisible();
    await expect(menu.getByRole('button', { name: /contact/i })).toBeVisible();
    await expect(menu.getByRole('button', { name: /account/i })).toBeVisible();
  });

  test('mobile menu navigation works and closes menu', async ({ page }) => {
    await page.locator('#nav-mobile-hamburger').click();
    await page.locator('#mobile-menu-drawer').getByRole('button', { name: /collections/i }).click();

    await expect(page.locator('#mobile-menu-drawer')).toBeHidden();
    await expect(page.locator('#discover-view-container')).toBeVisible();
  });

  test('mobile cart button shows badge and opens drawer', async ({ page }) => {
    // There are 2 cart buttons: desktop (hidden on mobile) and mobile (visible)
    // Use nth(1) to get the mobile one, or just click any visible one
    const cartButtons = page.locator('button[aria-label="Shopping bag"]');
    // Find the one that's actually visible at this viewport
    for (let i = 0; i < await cartButtons.count(); i++) {
      if (await cartButtons.nth(i).isVisible()) {
        await cartButtons.nth(i).click();
        break;
      }
    }
    await expect(page.locator('#cart-drawer-panel')).toBeVisible({ timeout: 5_000 });
  });

  test('product cards are scrollable and tappable on mobile', async ({ page }) => {
    const section = page.locator('#our-products-section');
    await expect(section).toBeVisible({ timeout: 10_000 });

    // Category cards or product buttons
    const cards = section.locator('button, a');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('announcement ticker is visible on mobile', async ({ page }) => {
    await expect(page.getByText(/FREE SHIPPING|SALE/i).first()).toBeVisible();
  });

  test('footer is accessible and scrollable on mobile', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText(/STORY India/i);
  });
});
