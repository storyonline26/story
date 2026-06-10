import { expect, test } from '@playwright/test';
import { generateUniqueEmail } from '../helpers/fixtures';

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#contact-view-container')).toBeVisible();
  });

  test('contact form renders and validates empty required fields', async ({ page }) => {
    await expect(page.locator('#contact-request-form')).toBeVisible();
    await page.getByRole('button', { name: /send request/i }).click();
    await expect.poll(() => page.locator('#contact-request-form input[required]').first().evaluate((input: HTMLInputElement) => input.matches(':invalid'))).toBe(true);
  });

  test('successful contact submission shows confirmation and resets the form', async ({ page }) => {
    await page.getByPlaceholder('Your name').fill('Story Contact Tester');
    await page.getByPlaceholder('you@example.com').fill(generateUniqueEmail('contact'));
    await page.getByPlaceholder('+91').fill('+919876543210');
    await page.getByPlaceholder('Tell us what you need.').fill('Please help me with sizing for the test product.');
    await page.getByRole('button', { name: /send request/i }).click();

    await expect(page.locator('#contact-request-form')).toContainText(/request has been received/i);
    await expect(page.getByPlaceholder('Your name')).toHaveValue('');
  });
});
