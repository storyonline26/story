import { expect, test } from '@playwright/test';

test.describe('About page', () => {
  test('about page loads brand story sections and images', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#about-view-container')).toBeVisible();
    await expect(page.getByRole('heading', { name: /verified|story|fashion/i }).first()).toBeVisible();
    await expect(page.locator('#about-view-container img').first()).toBeVisible();
  });

  test('navigation from about page still works', async ({ page }) => {
    await page.goto('/about');
    await page.locator('#nav-logo-btn').click();
    await expect(page.locator('#shop-view-container')).toBeVisible();
  });
});
