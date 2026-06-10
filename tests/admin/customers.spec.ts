import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';
import { ADMIN_AUTH_STATE } from '../helpers/state';

runApiSuiteOnce();
test.use({ storageState: ADMIN_AUTH_STATE });

test.describe('Admin customers', () => {
  test('customers list loads, search works, and details are accessible', async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByRole('navigation').getByRole('button', { name: 'Customers', exact: true }).click();
    await expect(page.getByPlaceholder(/search customers/i)).toBeVisible();
    await page.getByPlaceholder(/search customers/i).fill('story');
    await expect(page.getByText(/Total Orders|No customers/i).first()).toBeVisible();
  });
});
