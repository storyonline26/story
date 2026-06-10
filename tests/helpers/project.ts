import { test } from '@playwright/test';

export function runApiSuiteOnce() {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'API and single-surface suites run once in the chromium project.');
  });
}
