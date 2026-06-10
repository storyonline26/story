import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin dashboard', () => {
  test('dashboard shows key metrics and recent activity', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await expect(page.getByText(/Overview|Dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/orders|revenue|customers|products/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Products', exact: true })).toBeVisible();
  });
});
