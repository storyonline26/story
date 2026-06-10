import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const STORE_URL = process.env.STORE_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001';
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }]
  ],
  outputDir: './test-results',
  use: {
    baseURL: STORE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-testid'
  },
  webServer: [
    {
      command: 'npm --prefix backend run dev',
      url: `${API_URL}/health`,
      timeout: 120_000,
      reuseExistingServer: !isCI,
      env: {
        NODE_ENV: 'test',
        PORT: '5000',
        FRONTEND_URL: STORE_URL,
        ADMIN_FRONTEND_URL: ADMIN_URL,
        DISABLE_RATE_LIMIT: process.env.RUN_RATE_LIMIT_TESTS ? 'false' : 'true'
      }
    },
    {
      command: 'npm --prefix storyuser run dev',
      url: STORE_URL,
      timeout: 120_000,
      reuseExistingServer: !isCI,
      env: {
        VITE_API_BASE_URL: API_URL,
        DISABLE_HMR: 'true'
      }
    },
    {
      command: 'npm --prefix story-luxury-admin run dev',
      url: ADMIN_URL,
      timeout: 120_000,
      reuseExistingServer: !isCI,
      env: {
        VITE_API_BASE_URL: API_URL,
        DISABLE_HMR: 'true'
      }
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
});
