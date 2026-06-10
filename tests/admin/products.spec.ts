import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin products', () => {
  test('products list loads and supports search/filter controls', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('nav button:has-text("Products"), aside button:has-text("Products")').first().click();
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('add product button opens the product modal', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('nav button:has-text("Products"), aside button:has-text("Products")').first().click();
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /add product/i }).click();
    await expect(page.getByPlaceholder(/Relaxed Linen Shirt/i)).toBeVisible();
  });
});
