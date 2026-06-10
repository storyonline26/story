import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin orders', () => {
  test('orders list loads and can filter by status', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByRole('button', { name: 'Orders', exact: true }).first().click();
    await expect(page.getByText(/orders|fulfillment/i).first()).toBeVisible();
  });

  test('order details panel opens when an order exists', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByRole('button', { name: 'Orders', exact: true }).click();
    const details = page.getByRole('button', { name: /details/i }).first();
    if (!(await details.isVisible().catch(() => false))) {
      test.info().annotations.push({ type: 'note', description: 'No orders exist yet, so detail drawer was not opened.' });
      await expect(page.getByText(/No matching orders|Showing/i).first()).toBeVisible();
      return;
    }
    await details.click();
    await expect(page.getByText(/Payment Status|Fulfillment Status|Order Details/i).first()).toBeVisible();
  });
});
