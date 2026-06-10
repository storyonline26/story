import { expect, test } from '@playwright/test';

test.describe('Footer and branding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('footer shows all navigation sections: Shop, Story, Support, Connect', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('heading', { name: 'Shop' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'Story' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'Support' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'Connect' })).toBeVisible();
  });

  test('footer shop links navigate to category view', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.getByRole('button', { name: 'Uppers' }).click();
    // May navigate to category page or scroll to products section
    await expect(page.locator('#our-products-section, [id*="category"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('footer story links navigate to about and collections', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.getByRole('button', { name: 'Our Story' }).click();
    await expect(page.locator('#about-view-container')).toBeVisible();
  });

  test('footer contains copyright and legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText(/© STORY India/i);
    await expect(footer.getByRole('link', { name: /privacy policy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /return.*refund/i })).toBeVisible();
  });

  test('footer social links are visible (Instagram, WhatsApp, Email)', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /instagram/i })).toBeVisible();
    await expect(footer.getByRole('button', { name: /whatsapp/i })).toBeVisible();
    await expect(footer.getByRole('button', { name: /email/i })).toBeVisible();
  });

  test('footer displays contact info', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText(/\+91/);
    await expect(footer).toContainText(/care@story\.in/);
  });
});
