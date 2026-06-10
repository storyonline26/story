import fs from 'node:fs';
import { cleanupTestData } from './helpers/db';
import { AUTH_DIR, readTestState } from './helpers/state';

export default async function globalTeardown() {
  const state = readTestState();
  await cleanupTestData(state);

  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  }
}
