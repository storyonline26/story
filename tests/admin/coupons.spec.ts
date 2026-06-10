import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin coupons', () => {
  test('coupons list loads and create coupon modal exposes expected fields', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByRole('navigation').getByRole('button', { name: 'Coupons', exact: true }).click();
    await expect(page.getByRole('button', { name: /create coupon/i })).toBeVisible();
    await page.getByRole('button', { name: /create coupon/i }).click();
    await expect(page.getByPlaceholder(/WELCOME15/i)).toBeVisible();
    await expect(page.getByPlaceholder(/15% Off/i)).toBeVisible();
  });
});
