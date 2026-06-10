import { expect, test } from '@playwright/test';
import { API_URL } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('API health', () => {
  test('GET /api/health returns success status quickly', async ({ request }) => {
    const startedAt = Date.now();
    const response = await request.get(`${API_URL}/health`);
    const elapsedMs = Date.now() - startedAt;

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();
    expect(await response.json()).toMatchObject({
      success: true,
      data: { status: 'ok' }
    });
    expect(elapsedMs).toBeLessThan(500);
  });
});
