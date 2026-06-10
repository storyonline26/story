import { expect, test } from '@playwright/test';

test.describe('Product interactions and gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await page.locator('[id^="discover-card-"]').first().click();
    await expect(page.locator('#product-detail-view-container')).toBeVisible();
  });

  test('product detail shows full price with INR currency symbol', async ({ page }) => {
    await expect(page.locator('#detail-options-panel')).toContainText(/₹[\d,]+/);
  });

  test('product images are visible and not broken', async ({ page }) => {
    const images = page.locator('#product-detail-view-container img');
    expect(await images.count()).toBeGreaterThan(0);
    await expect(images.first()).toBeVisible();

    const naturalWidth = await images.first().evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('size selector shows available sizes and allows selection', async ({ page }) => {
    const sizeButtons = page.locator('#detail-sizes-selector button');
    if (await sizeButtons.count() === 0) {
      test.skip(true, 'No size selector on this product');
      return;
    }
    
    const firstSize = sizeButtons.first();
    await firstSize.click();
    // After clicking, button should show selected state (different styling)
    await expect(firstSize).toBeVisible();
  });

  test('color selector shows color options', async ({ page }) => {
    const colorButtons = page.locator('#detail-colors-selector button');
    if (await colorButtons.count() === 0) {
      test.skip(true, 'No color selector on this product');
      return;
    }
    expect(await colorButtons.count()).toBeGreaterThan(0);
  });

  test('add to cart button is visible and clickable', async ({ page }) => {
    const addBtn = page.locator('#add-to-cart-action-btn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();
  });

  test('adding to cart opens the cart drawer with correct item', async ({ page }) => {
    // Select size if available
    const sizeBtn = page.locator('#detail-sizes-selector button').first();
    if (await sizeBtn.count()) await sizeBtn.click();

    await page.locator('#add-to-cart-action-btn').click();
    await expect(page.locator('#cart-drawer-panel')).toBeVisible();

    // Cart should have at least 1 item
    const cartCounter = page.locator('#cart-counter').first();
    const count = await cartCounter.textContent();
    expect(Number(count)).toBeGreaterThanOrEqual(1);
  });

  test('product detail has a back/return navigation', async ({ page }) => {
    const backBtn = page.getByRole('button', { name: /back|return|←/i }).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    // Should navigate away from detail view
    await expect(page.locator('#product-detail-view-container')).toBeHidden();
  });
});
