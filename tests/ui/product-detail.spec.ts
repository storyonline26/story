import { expect, test } from '@playwright/test';
import { ProductPage } from '../helpers/pages';

async function openFirstProduct(page: import('@playwright/test').Page) {
  await page.goto('/collections');
  await expect(page.locator('#discover-view-container')).toBeVisible();
  await page.locator('[id^="discover-card-"]').first().click();
  await expect(page.locator('#product-detail-view-container')).toBeVisible();
}

test.describe('Product detail', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstProduct(page);
  });

  test('detail view shows name, price, description, images, selectors, and recommendations', async ({ page }) => {
    const product = new ProductPage(page);
    await expect(product.getTitle()).toBeVisible();
    await expect(product.getPrice()).toBeVisible();
    await expect(page.locator('#detail-images-rack img').first()).toBeVisible();
    await expect(page.locator('#detail-options-panel')).toContainText(/SELECT COLOUR|MEASURE CAPSULE|ADD ASSEMBLY/i);
    await expect(page.locator('#detail-complementary-section')).toBeVisible();
  });

  test('selecting size/color and adding to cart opens the drawer', async ({ page }) => {
    const product = new ProductPage(page);
    await product.selectSize('M');
    await product.selectColor('Black');
    await product.addToCart();
    await expect(page.locator('[id^="cart-drawer-item-"]').first()).toBeVisible();
  });

  test('back button returns to the previous product list', async ({ page }) => {
    await page.locator('#detail-back-btn').click();
    await expect(page.locator('#shop-view-container')).toBeVisible();
  });
});
