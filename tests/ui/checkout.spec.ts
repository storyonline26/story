import { expect, test } from '@playwright/test';
import { addCartItem, clearCart, createAddress } from '../helpers/api';
import { cookieValue, registerFreshUser } from '../helpers/auth';
import { SAMPLE_ADDRESS, toApiAddress } from '../helpers/fixtures';
import { readTestState } from '../helpers/state';

// Increase timeout for checkout tests that hit Neon DB
test.setTimeout(60_000);

test.describe('Storefront checkout', () => {
  test('bag page shows cart items, totals, address area, and login prompt for guests', async ({ page }) => {
    await page.goto('/collections');
    await page.locator('[id^="discover-card-"]').first().click();
    await page.locator('#add-to-cart-action-btn').click();
    await page.locator('#cart-drawer-checkout-btn').click();

    await expect(page.locator('#bag-view-container')).toBeVisible();
    await expect(page.locator('#bag-summary-sidebar')).toContainText(/Subtotal|GST|Total/i);
    await expect(page.locator('#checkout-signin-btn')).toBeVisible();
  });

  test('logged-in checkout can reach the Razorpay open step when payment is configured', async ({ browser, request }) => {
    const { cookies } = await registerFreshUser(request);
    const state = readTestState();
    await clearCart(request, cookies);
    await addCartItem(request, state.product?.id || '', cookies);
    await createAddress(request, toApiAddress(SAMPLE_ADDRESS), cookies);

    const context = await browser.newContext();
    await context.addCookies([{
      name: 'token',
      value: cookieValue(cookies, 'token') || '',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }]);
    await context.addInitScript(() => {
      (window as any).Razorpay = class MockRazorpay {
        options: Record<string, unknown>;
        constructor(options: Record<string, unknown>) {
          this.options = options;
          (window as any).__razorpayOptions = options;
        }
        open() {
          (window as any).__razorpayOpened = true;
        }
      };
    });
    const page = await context.newPage();
    await page.goto('/bag');
    const proceed = page.locator('#checkout-proceed-btn');
    await expect(proceed).toBeVisible();
    if (await proceed.isDisabled()) {
      await expect(page.locator('#bag-view-container')).toContainText(/payment unavailable|disabled by store admin/i);
      await context.close();
      return;
    }
    await proceed.click();

    await expect
      .poll(() => page.evaluate(() => Boolean((window as any).__razorpayOpened)), { timeout: 15_000 })
      .toBe(true);
    await context.close();
  });
});
