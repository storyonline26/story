import { expect, test } from '@playwright/test';
import { ADMIN_URL, TEST_ADMIN, TEST_USER } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('Admin login', () => {
  test('admin login page renders and accepts admin credentials', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await page.getByPlaceholder('admin@story.in').fill(TEST_ADMIN.email);
    await page.getByPlaceholder('StoryAdmin@2026').fill(TEST_ADMIN.password);
    await page.getByRole('button', { name: /open admin panel/i }).click();
    await expect(page.getByText(/India Fulfillment Online|Overview|Workspace Menu/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('regular users cannot access the admin panel', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByPlaceholder('admin@story.in').fill(TEST_USER.email);
    await page.getByPlaceholder('StoryAdmin@2026').fill(TEST_USER.password);
    await page.getByRole('button', { name: /open admin panel/i }).click();
    await expect(page.getByText(/does not have admin access|admin login failed/i)).toBeVisible();
  });
});
