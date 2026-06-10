import { expect, test } from '@playwright/test';

test.describe('Visual screenshots - Desktop', () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shop-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('collections page', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('collections-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#about-view-container')).toBeVisible();
    await expect(page).toHaveScreenshot('about-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#contact-view-container')).toBeVisible();
    await expect(page).toHaveScreenshot('contact-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('login page', async ({ page }) => {
    await page.goto('/account');
    await expect(page.locator('#login-view-root')).toBeVisible();
    await expect(page).toHaveScreenshot('login-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('navbar and announcement ticker', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-navbar')).toBeVisible();
    await expect(page.locator('#global-navbar')).toHaveScreenshot('navbar-desktop.png', {
      maxDiffPixelRatio: 0.03,
    });
  });
});

test.describe('Visual screenshots - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('homepage mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shop-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('mobile menu open', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-mobile-hamburger').click();
    await expect(page.locator('#mobile-menu-drawer')).toBeVisible();
    await expect(page).toHaveScreenshot('mobile-menu-open.png', {
      maxDiffPixelRatio: 0.03,
    });
  });

  test('collections mobile', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('collections-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
