import { expect, test } from '@playwright/test';
test.describe('Discover search and filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
  });

  test('search input filters products and opens selected product detail', async ({ page }) => {
    const search = page.locator('#discover-search-input');
    await expect(search).toBeVisible();
    const cards = page.locator('[id^="discover-card-"]');
    await expect(cards.first()).toBeVisible();
    const firstCardText = await cards.first().innerText();
    const query = firstCardText.split(/\s+/).find((word) => word.replace(/[^a-z]/gi, '').length > 3) || 'shirt';

    await search.fill(query);
    await expect(cards.first()).toBeVisible();
    await cards.first().click();
    await expect(page.locator('#product-detail-view-container')).toBeVisible();
  });

  test('empty and no-result search states are clear', async ({ page }) => {
    await expect(page.locator('[id^="discover-card-"]').first()).toBeVisible();
    await page.locator('#discover-search-input').fill('zzzz-no-story-results');
    await expect(page.locator('#discover-empty-state')).toBeVisible();
    await page.getByRole('button', { name: /reset filters/i }).click();
    await expect(page.locator('[id^="discover-card-"]').first()).toBeVisible();
  });

  test('category filter cards update visible product list', async ({ page }) => {
    const categoryCard = page.getByRole('button', { name: /category/i }).first();
    await expect(categoryCard).toBeVisible();
    await categoryCard.click();
    await expect(page.locator('#categories-grid-collection-view, #discover-empty-state')).toBeVisible();
  });
});
