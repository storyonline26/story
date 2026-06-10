import { expect, test } from '@playwright/test';

test.describe('Customer reviews and testimonials', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('customer notes section is visible with heading and reviews', async ({ page }) => {
    const section = page.locator('[aria-label="Customer notes"]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: /customer/i })).toBeVisible();
    await expect(section).toContainText(/What Our Customers Say/i);
  });

  test('testimonial cards show reviewer name, tag, stars, and quote', async ({ page }) => {
    const section = page.locator('[aria-label="Customer notes"]');
    const articles = section.locator('article');
    expect(await articles.count()).toBeGreaterThan(0);

    const first = articles.first();
    await expect(first.locator('h3')).toBeVisible();
    await expect(first).toContainText('★');
    await expect(first.locator('p')).toBeVisible();
  });

  test('testimonial navigation buttons exist (previous/next)', async ({ page }) => {
    const section = page.locator('[aria-label="Customer notes"]');
    await expect(section.getByRole('button', { name: /previous/i })).toBeVisible();
    await expect(section.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('write a review button is visible', async ({ page }) => {
    const section = page.locator('[aria-label="Customer notes"]');
    await expect(section.getByRole('button', { name: /write a review/i })).toBeVisible();
  });
});

test.describe('Our Story section on homepage', () => {
  test('story section shows heading and read more button', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[aria-label="Our story"]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading')).toBeVisible();
    await expect(section.getByRole('button', { name: /read the story/i })).toBeVisible();
  });

  test('read the story button navigates to about page', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[aria-label="Our story"]');
    await section.getByRole('button', { name: /read the story/i }).click();
    await expect(page.locator('#about-view-container')).toBeVisible();
    await expect(page).toHaveURL(/\/about/);
  });
});
