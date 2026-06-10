import { expect, test } from '@playwright/test';
import { HomePage } from '../helpers/pages';

test.describe('Storefront homepage', () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).navigate();
  });

  test('page loads with title, navbar, announcement ticker, hero, category grid, and footer', async ({ page }) => {
    await expect(page).toHaveTitle(/STORY India/i);
    await expect(page.locator('#global-navbar')).toBeVisible();
    await expect(page.locator('#nav-logo-btn')).toBeVisible();
    await expect(page.getByText(/FREE SHIPPING|SALE|AUTHENTIC/i).first()).toBeVisible();
    await expect(page.locator('#editorial-hero')).toBeVisible();
    await expect(page.locator('#editorial-hero img').first()).toBeVisible();
    await expect(page.locator('#our-products-section')).toBeVisible();
    await expect(page.locator('#our-products-section button').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('hero CTA buttons navigate to collection areas', async ({ page }) => {
    const hero = page.locator('#editorial-hero');
    await hero.getByRole('button', { name: /explore|shop|collection|drop/i }).first().click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await expect(page.locator('#our-products-section')).toBeVisible();

    await page.goto('/');
    await page.locator('#editorial-hero').getByRole('button', { name: /style|lookbook|view/i }).first().click();
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await expect(page).toHaveURL(/\/collections/);
  });

  for (const width of [375, 768, 1440]) {
    test(`homepage remains readable at ${width}px width`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('#global-navbar')).toBeVisible();
      await expect(page.locator('#editorial-hero h1')).toBeVisible();
      await expect(page.locator('#our-products-section')).toBeVisible();
    });
  }
});
