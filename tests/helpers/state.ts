import fs from 'node:fs';
import path from 'node:path';

export const AUTH_DIR = path.resolve(process.cwd(), '.auth');
export const USER_AUTH_STATE = path.join(AUTH_DIR, 'user.json');
export const ADMIN_AUTH_STATE = path.join(AUTH_DIR, 'admin.json');
export const TEST_STATE_FILE = path.join(AUTH_DIR, 'test-state.json');

export interface TestState {
  runId: string;
  user?: { id: string; email: string };
  admin?: { id: string; email: string; createdBySetup: boolean };
  category?: { id: string; slug: string; name: string };
  product?: { id: string; slug: string; name: string; sku: string };
  coupon?: { id: string; code: string };
  settings?: Array<{ key: string; value: string | null }>;
}

export function ensureAuthDir() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

export function writeTestState(state: TestState) {
  ensureAuthDir();
  fs.writeFileSync(TEST_STATE_FILE, JSON.stringify(state, null, 2));
}

export function readTestState(): TestState {
  if (!fs.existsSync(TEST_STATE_FILE)) return { runId: 'missing' };
  return JSON.parse(fs.readFileSync(TEST_STATE_FILE, 'utf8')) as TestState;
}
