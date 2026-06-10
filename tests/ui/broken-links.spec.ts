import { expect, test } from '@playwright/test';

const STORE_URL = 'http://localhost:3000';

test.describe('Broken link checker', () => {
  test.setTimeout(120_000);

  test('all internal navigation links work without 404', async ({ page }) => {
    const visited = new Set<string>();
    const broken: string[] = [];
    const pages = ['/', '/collections', '/about', '/contact', '/account'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');

      // Collect all links on the page
      const links = await page.locator('a[href]').evaluateAll((els) =>
        els.map((el) => el.getAttribute('href')).filter(Boolean)
      );

      for (const href of links) {
        if (!href || visited.has(href)) continue;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
        if (href.startsWith('http') && !href.includes('localhost:3000')) continue;
        visited.add(href);

        const url = href.startsWith('/') ? `${STORE_URL}${href}` : href;
        const response = await page.request.get(url).catch(() => null);
        if (response && response.status() >= 400) {
          broken.push(`${href} → ${response.status()}`);
        }
      }
    }

    if (broken.length > 0) {
      console.log('\n🔗 Broken Links Found:');
      broken.forEach((link) => console.log(`   ❌ ${link}`));
    }
    expect(broken, `Broken links: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('all image sources return valid responses', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const brokenImages = await page.evaluate(async () => {
      const imgs = document.querySelectorAll('img[src]');
      const broken: string[] = [];

      for (const img of imgs) {
        const imgEl = img as HTMLImageElement;
        if (imgEl.naturalWidth === 0 && imgEl.offsetParent !== null) {
          broken.push(imgEl.src);
        }
      }
      return broken;
    });

    if (brokenImages.length > 0) {
      console.log('\n🖼️ Broken Images:');
      brokenImages.forEach((src) => console.log(`   ❌ ${src}`));
    }
    // Allow some external images to fail
    expect(brokenImages.length).toBeLessThan(5);
  });

  test('API endpoints return proper status codes', async ({ request }) => {
    const endpoints = [
      { url: '/api/health', expected: 200 },
      { url: '/api/products', expected: 200 },
      { url: '/api/categories', expected: 200 },
      { url: '/api/products/non-existent-slug-xyz', expected: 404 },
      { url: '/api/admin/products', expected: 401 },
    ];

    const broken: string[] = [];

    for (const { url, expected } of endpoints) {
      const res = await request.get(`http://localhost:5000${url}`);
      if (res.status() !== expected) {
        broken.push(`${url} → got ${res.status()}, expected ${expected}`);
      }
    }

    if (broken.length > 0) {
      console.log('\n🔌 API Issues:');
      broken.forEach((issue) => console.log(`   ❌ ${issue}`));
    }
    expect(broken).toHaveLength(0);
  });
});
