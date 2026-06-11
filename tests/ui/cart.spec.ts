import { expect, test } from '@playwright/test';
import { addCartItem, clearCart } from '../helpers/api';
import { cookieValue, registerFreshUser } from '../helpers/auth';
import { CartDrawer, ProductPage } from '../helpers/pages';
import { readTestState } from '../helpers/state';

async function addFirstVisibleProduct(page: import('@playwright/test').Page) {
  await page.goto('/collections');
  await page.locator('[id^="discover-card-"]').first().click();
  await expect(page.locator('#product-detail-view-container')).toBeVisible();
  // Select first size if available
  const sizeBtn = page.locator('#detail-sizes-selector button, [id*="size"] button').first();
  if (await sizeBtn.isVisible().catch(() => false)) await sizeBtn.click();
  await new ProductPage(page).addToCart();
}

// Increase timeout for tests that hit Neon DB
test.setTimeout(60_000);

test.describe('Cart drawer and bag', () => {
  test('cart drawer opens and shows the empty state', async ({ page }) => {
    await page.goto('/');
    const cart = new CartDrawer(page);
    await cart.open();
    await expect(page.locator('#cart-drawer-empty-state')).toBeVisible();
  });

  test('cart item quantity, total, checkout, and remove controls work', async ({ page }) => {
    await addFirstVisibleProduct(page);
    const cart = new CartDrawer(page);
    await expect(cart.getItems()).toHaveCount(1);
    await expect(page.locator('#cart-drawer-panel')).toContainText(/SECURED BAG VALUE|ACCRUED TOTAL/i);

    await cart.updateQuantity('increase');
    await expect(page.locator('#cart-counter').first()).toContainText(/2/);

    await cart.checkout();
    await expect(page.locator('#bag-view-container')).toBeVisible();
    await page.getByRole('button', { name: /remove/i }).first().click();
    await expect(page.locator('#bag-empty-state')).toBeVisible();
  });

  test('logged-in cart persists after page refresh', async ({ browser, request }) => {
    const { cookies } = await registerFreshUser(request);
    const state = readTestState();
    await clearCart(request, cookies);
    await addCartItem(request, state.product?.id || '', cookies);

    const context = await browser.newContext();
    await context.addCookies([{
      name: 'token',
      value: cookieValue(cookies, 'token') || '',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }]);
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(3_000);
    await page.locator('button[aria-label="Shopping bag"]').first().click();
    await expect(page.locator('[id^="cart-drawer-item-"]').first()).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await page.waitForTimeout(3_000);
    await page.locator('button[aria-label="Shopping bag"]').first().click();
    await expect(page.locator('[id^="cart-drawer-item-"]').first()).toBeVisible({ timeout: 15_000 });
    await context.close();
  });
});
