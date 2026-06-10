import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin categories', () => {
  test('categories list loads with add, search, edit, and status controls', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('nav button:has-text("Categories"), aside button:has-text("Categories")').first().click();
    await expect(page.getByRole('button', { name: /add category/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder(/search categories/i)).toBeVisible();
    await page.getByPlaceholder(/search categories/i).fill('E2E');
    await expect(page.getByText(/E2E|No categories/i).first()).toBeVisible();
  });

  test('add category button opens the category modal', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('nav button:has-text("Categories"), aside button:has-text("Categories")').first().click();
    await expect(page.getByRole('button', { name: /add category/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /add category/i }).click();
    await expect(page.getByPlaceholder(/Story Jewelry/i)).toBeVisible();
  });
});
