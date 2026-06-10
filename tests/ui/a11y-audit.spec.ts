import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility rules to exclude (known non-critical issues for SPAs)
const EXCLUDED_RULES = [
  'color-contrast', // Often triggers on animated/transparent elements
];

test.describe('Accessibility audit - axe-core', () => {
  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shop-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious = results.violations.filter(v => v.impact === 'serious');

    expect(critical, formatViolations(critical)).toHaveLength(0);
    expect(serious.length, formatViolations(serious)).toBeLessThanOrEqual(3);
  });

  test('collections page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('about page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#about-view-container')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('contact page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#contact-view-container')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/account');
    await expect(page.locator('#login-view-root')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('product detail page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('#discover-view-container')).toBeVisible();
    await page.locator('[id^="discover-card-"]').first().click();
    await expect(page.locator('#product-detail-view-container')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('mobile homepage has no critical accessibility violations', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('#shop-view-container')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(EXCLUDED_RULES)
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, formatViolations(critical)).toHaveLength(0);
  });

  test('full accessibility report summary', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shop-view-container')).toBeVisible();
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();

    // Log summary for the report
    const summary = {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length,
      moderate: results.violations.filter(v => v.impact === 'moderate').length,
      minor: results.violations.filter(v => v.impact === 'minor').length,
    };

    console.log('\n📊 Accessibility Audit Summary:');
    console.log(`   ✅ Passes: ${summary.passes}`);
    console.log(`   ❌ Violations: ${summary.violations}`);
    console.log(`      🔴 Critical: ${summary.critical}`);
    console.log(`      🟠 Serious: ${summary.serious}`);
    console.log(`      🟡 Moderate: ${summary.moderate}`);
    console.log(`      🔵 Minor: ${summary.minor}`);
    console.log(`   ⚠️  Incomplete: ${summary.incomplete}\n`);

    // No critical violations allowed
    expect(summary.critical).toBe(0);
  });
});

function formatViolations(violations: any[]) {
  if (violations.length === 0) return '';
  return violations.map(v =>
    `\n  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n    Affected: ${v.nodes.map((n: any) => n.target.join(' > ')).join(', ')}`
  ).join('');
}
