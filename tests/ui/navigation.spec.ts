import { expect, test, type Page } from '@playwright/test';

async function clickNav(page: Page, label: RegExp) {
  const direct = page.getByRole('button', { name: label }).first();
  if (await direct.isVisible().catch(() => false)) {
    await direct.click();
    return;
  }

  await page.locator('#nav-mobile-hamburger').click();
  await page.getByRole('button', { name: label }).first().click();
}

test.describe('Storefront navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-navbar')).toBeVisible();
  });

  test('top navigation reaches shop, categories, collections, story, and contact', async ({ page }) => {
    await clickNav(page, /^shop$/i);
    await expect(page.locator('#shop-view-container')).toBeVisible();

    await clickNav(page, /^categories$/i);
    await expect(page.locator('#our-products-section')).toBeInViewport();

    await clickNav(page, /^collections$/i);
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await expect(page).toHaveURL(/\/collections/);

    await clickNav(page, /^our story$/i);
    await expect(page.locator('#about-view-container')).toBeVisible();
    await expect(page).toHaveURL(/\/about/);

    await clickNav(page, /^contact$/i);
    await expect(page.locator('#contact-view-container')).toBeVisible();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('logo, search, account, and bag controls work', async ({ page }) => {
    await clickNav(page, /^collections$/i);
    await page.locator('#nav-logo-btn').click();
    await expect(page.locator('#shop-view-container')).toBeVisible();

    await page.locator('#nav-search-btn, button[aria-label="Search products"], button[aria-label="Search"]').first().click();
    await expect(page.locator('#discover-view-container')).toBeVisible({ timeout: 10_000 });

    await page.locator('#nav-user-btn, button[aria-label="Account"]').first().click();
    await expect(page.locator('#login-view-root, #settings-view-container')).toBeVisible();

    await page.locator('button[aria-label="Shopping bag"]').first().click();
    await expect(page.locator('#cart-drawer-panel')).toBeVisible();
  });

  test('browser back/forward and direct URL navigation work', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#about-view-container')).toBeVisible();
    await page.goto('/contact');
    await expect(page.locator('#contact-view-container')).toBeVisible();

    await page.goBack();
    await expect(page.locator('#about-view-container')).toBeVisible();
    await page.goForward();
    await expect(page.locator('#contact-view-container')).toBeVisible();

    for (const path of ['/collections', '/account', '/bag']) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path));
    }
  });
});
