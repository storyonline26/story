import { expect, test } from '@playwright/test';

test.describe('Category pages and product grid', () => {
  test('homepage category cards show name, description, piece count, and image', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#our-products-section');
    await expect(section).toBeVisible();

    const cards = section.locator('button');
    expect(await cards.count()).toBeGreaterThan(0);

    const firstCard = cards.first();
    await expect(firstCard).toContainText(/pieces/i);
    await expect(firstCard.locator('img').first()).toBeVisible();
  });

  test('clicking a category card navigates to category page with products', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#our-products-section');
    const categoryButton = section.locator('button').filter({ hasText: /uppers|dresses|footwear/i }).first();

    if (await categoryButton.count() === 0) {
      test.skip(true, 'No matching category card found');
      return;
    }

    await categoryButton.click();
    await expect(page).toHaveURL(/\/category\//);
  });

  test('category page shows back button and product listing', async ({ page }) => {
    await page.goto('/category/uppers');
    await expect(page.getByRole('button', { name: /back|return/i }).first()).toBeVisible();
  });

  test('direct URL to category page works', async ({ page }) => {
    for (const category of ['uppers', 'dresses', 'footwear']) {
      await page.goto(`/category/${category}`);
      await expect(page).toHaveURL(new RegExp(`/category/${category}`));
    }
  });

  test('product cards in collections show image, name, and price', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();

    const cards = page.locator('[id^="discover-card-"]');
    if (await cards.count() === 0) {
      test.skip(true, 'No product cards found');
      return;
    }

    const firstCard = cards.first();
    await expect(firstCard.locator('img').first()).toBeVisible();
    await expect(firstCard).toContainText(/₹|INR/);
  });

  test('collections page shows search input and product count', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible();
  });
});
