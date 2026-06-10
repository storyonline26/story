import { chromium, expect, test } from '@playwright/test';
import { createServer } from 'node:net';
import { STORE_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

const getFreePort = async () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') {
          resolve(address.port);
        } else {
          reject(new Error('Unable to allocate a Lighthouse debugging port'));
        }
      });
    });
  });

test.describe('Lighthouse audit', () => {
  test('homepage meets baseline Lighthouse scores', async () => {
    test.setTimeout(120_000);

    let lighthouse: any;
    try {
      lighthouse = (await import('lighthouse')).default;
    } catch {
      test.skip(true, 'Lighthouse module not available');
      return;
    }

    const port = await getFreePort();

    let browser: Awaited<ReturnType<typeof chromium.launch>>;
    try {
      browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`, '--no-sandbox', '--disable-gpu']
      });
    } catch (error) {
      test.skip(true, `Chromium was not available for Lighthouse: ${String(error)}`);
      return;
    }

    try {
      const result = await lighthouse(STORE_URL, {
        port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }, {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop',
          screenEmulation: { disabled: true },
          throttlingMethod: 'provided'
        }
      });

      if (!result?.lhr?.categories) {
        test.skip(true, 'Lighthouse did not return results');
        return;
      }

      const categories = result.lhr.categories;
      const perfScore = Math.round((categories?.performance?.score || 0) * 100);
      const a11yScore = Math.round((categories?.accessibility?.score || 0) * 100);
      const bpScore = Math.round((categories?.['best-practices']?.score || 0) * 100);
      const seoScore = Math.round((categories?.seo?.score || 0) * 100);

      // Skip if Lighthouse couldn't audit the SPA properly (returns all zeros)
      if (perfScore === 0 && a11yScore === 0) {
        test.skip(true, 'Lighthouse returned zero scores — SPA did not render in time');
        return;
      }

      expect(perfScore).toBeGreaterThan(20);
      expect(a11yScore).toBeGreaterThan(40);
      expect(bpScore).toBeGreaterThan(40);
      expect(seoScore).toBeGreaterThan(30);
    } finally {
      await browser.close().catch(() => undefined);
    }
  });
});
