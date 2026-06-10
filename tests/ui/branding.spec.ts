import { expect, test } from '@playwright/test';

test.describe('Announcement ticker and brand visuals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('announcement ticker displays all promotional messages', async ({ page }) => {
    const ticker = page.getByText(/FREE SHIPPING|SALE 20% OFF|AUTHENTIC/i).first();
    await expect(ticker).toBeVisible();
    await expect(ticker).toContainText(/FREE SHIPPING/);
    await expect(ticker).toContainText(/SALE 20% OFF/);
    await expect(ticker).toContainText(/AUTHENTIC/);
    await expect(ticker).toContainText(/EASY RETURNS/);
  });

  test('announcement ticker has scrolling animation', async ({ page }) => {
    const ticker = page.locator('.animate-marquee').first();
    await expect(ticker).toBeVisible();
    const style = await ticker.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(style).not.toBe('none');
  });

  test('navbar logo shows STORY brand with tagline', async ({ page }) => {
    const logo = page.locator('#nav-logo-btn');
    await expect(logo).toBeVisible();
    // Logo has STORY in SVG text or as aria-label, and tagline as visible text
    const hasStory = await logo.evaluate((el) => {
      return el.textContent?.includes('STORY') || el.innerHTML.includes('STORY') || el.getAttribute('aria-label')?.includes('STORY');
    });
    expect(hasStory).toBe(true);
    await expect(logo).toContainText(/WRITE YOUR OWN FASHION/);
  });

  test('brand logo marquee section shows luxury brand logos', async ({ page }) => {
    const brands = page.locator('[aria-label="Featured brands"]');
    await expect(brands).toBeVisible();
    const logos = brands.locator('img');
    expect(await logos.count()).toBeGreaterThan(5);
  });

  test('hero section has editorial images that are visible', async ({ page }) => {
    const hero = page.locator('#editorial-hero');
    await expect(hero).toBeVisible();
    const images = hero.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
    await expect(images.first()).toBeVisible();
  });

  test('hero section displays heading, description, and CTA buttons', async ({ page }) => {
    const hero = page.locator('#editorial-hero');
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.locator('p').first()).toBeVisible();
    const buttons = hero.getByRole('button');
    expect(await buttons.count()).toBeGreaterThanOrEqual(2);
  });
});
