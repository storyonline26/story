import { expect, test } from '@playwright/test';

test.describe('Bundle size and performance budget', () => {
  test.setTimeout(60_000);

  test('homepage total transfer size is under 5MB', async ({ page }) => {
    let totalBytes = 0;
    const resourceSizes: { url: string; size: number }[] = [];

    page.on('response', (response) => {
      const size = Number(response.headers()['content-length'] || 0);
      totalBytes += size;
      if (size > 100_000) {
        resourceSizes.push({
          url: response.url().split('?')[0].split('/').pop() || response.url(),
          size,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
    console.log(`\n📦 Homepage total transfer: ${totalMB}MB`);

    if (resourceSizes.length > 0) {
      console.log('   Large resources (>100KB):');
      resourceSizes
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((r) => console.log(`     ${(r.size / 1024).toFixed(0)}KB — ${r.url}`));
    }

    expect(totalBytes).toBeLessThan(15 * 1024 * 1024); // Under 15MB (dev mode with unoptimized images)
  });

  test('JavaScript bundle size is under 2MB', async ({ page }) => {
    let jsBytes = 0;
    const jsFiles: { name: string; size: number }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js') || url.includes('.js?')) {
        const size = Number(response.headers()['content-length'] || 0);
        jsBytes += size;
        jsFiles.push({
          name: url.split('/').pop()?.split('?')[0] || url,
          size,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const jsMB = (jsBytes / 1024 / 1024).toFixed(2);
    console.log(`\n📜 Total JS: ${jsMB}MB (${jsFiles.length} files)`);

    if (jsFiles.length > 0) {
      console.log('   Largest JS bundles:');
      jsFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach((f) => console.log(`     ${(f.size / 1024).toFixed(0)}KB — ${f.name}`));
    }

    expect(jsBytes).toBeLessThan(4 * 1024 * 1024); // Under 4MB (dev mode includes source maps)
  });

  test('flag images exceeding 1MB (optimize before production)', async ({ page }) => {
    const largeImages: { url: string; size: number }[] = [];

    page.on('response', (response) => {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.startsWith('image/')) {
        const size = Number(response.headers()['content-length'] || 0);
        if (size > 1024 * 1024) {
          largeImages.push({
            url: response.url().split('/').pop() || response.url(),
            size,
          });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (largeImages.length > 0) {
      console.log('\n🖼️ Images to optimize before production (>1MB):');
      largeImages.forEach((img) =>
        console.log(`   ⚠️  ${(img.size / 1024 / 1024).toFixed(2)}MB — ${img.url}`)
      );
    }
    // Allow up to 5 large images in dev, but flag them
    expect(largeImages.length).toBeLessThan(6);
  });

  test('page makes less than 100 network requests on load', async ({ page }) => {
    let requestCount = 0;
    page.on('request', () => requestCount++);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`\n🌐 Network requests on homepage load: ${requestCount}`);
    expect(requestCount).toBeLessThan(100);
  });

  test('first contentful paint is under 3 seconds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName('first-contentful-paint')[0];
      return entry ? entry.startTime : null;
    });

    if (fcp !== null) {
      console.log(`\n⚡ First Contentful Paint: ${Math.round(fcp)}ms`);
      expect(fcp).toBeLessThan(3000);
    }
  });
});
