import { expect, test } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

function runAudit(dir: string) {
  try {
    const output = execSync('npm audit --json 2>nul', { cwd: dir, encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (error: any) {
    // npm audit exits with non-zero if vulnerabilities found
    try {
      return JSON.parse(error.stdout || '{}');
    } catch {
      return null;
    }
  }
}

test.describe('Dependency security audit', () => {
  test('backend has no critical vulnerabilities', async () => {
    const result = runAudit(path.join(ROOT, 'backend'));
    if (!result || !result.metadata) {
      test.skip(true, 'Could not run npm audit on backend');
      return;
    }

    const { critical, high } = result.metadata.vulnerabilities || {};
    console.log(`\n🔒 Backend Dependencies:`);
    console.log(`   Critical: ${critical || 0}`);
    console.log(`   High: ${high || 0}`);
    console.log(`   Moderate: ${result.metadata.vulnerabilities?.moderate || 0}`);
    console.log(`   Low: ${result.metadata.vulnerabilities?.low || 0}`);

    expect(critical || 0, 'Backend has critical vulnerabilities!').toBe(0);
  });

  test('user store frontend has no critical vulnerabilities', async () => {
    const result = runAudit(path.join(ROOT, 'storyuser'));
    if (!result || !result.metadata) {
      test.skip(true, 'Could not run npm audit on storyuser');
      return;
    }

    const { critical, high } = result.metadata.vulnerabilities || {};
    console.log(`\n🔒 Store Frontend Dependencies:`);
    console.log(`   Critical: ${critical || 0}`);
    console.log(`   High: ${high || 0}`);
    console.log(`   Moderate: ${result.metadata.vulnerabilities?.moderate || 0}`);

    expect(critical || 0, 'Frontend has critical vulnerabilities!').toBe(0);
  });

  test('admin panel has no critical vulnerabilities', async () => {
    const result = runAudit(path.join(ROOT, 'story-luxury-admin'));
    if (!result || !result.metadata) {
      test.skip(true, 'Could not run npm audit on admin');
      return;
    }

    const { critical, high } = result.metadata.vulnerabilities || {};
    console.log(`\n🔒 Admin Panel Dependencies:`);
    console.log(`   Critical: ${critical || 0}`);
    console.log(`   High: ${high || 0}`);

    expect(critical || 0, 'Admin panel has critical vulnerabilities!').toBe(0);
  });

  test('no known vulnerable packages in production dependencies', async () => {
    const knownBadPackages = [
      'event-stream',    // Supply chain attack
      'flatmap-stream',  // Malicious
      'ua-parser-js',    // Compromised versions
    ];

    for (const dir of ['backend', 'storyuser', 'story-luxury-admin']) {
      let packageLock: any;
      try {
        const lockContent = require('node:fs').readFileSync(
          path.join(ROOT, dir, 'package-lock.json'), 'utf-8'
        );
        packageLock = JSON.parse(lockContent);
      } catch {
        continue;
      }

      const packages = Object.keys(packageLock.packages || packageLock.dependencies || {});
      for (const bad of knownBadPackages) {
        const found = packages.some(p => p.includes(`/${bad}`) || p === bad);
        expect(found, `${dir} contains known malicious package: ${bad}`).toBe(false);
      }
    }
  });
});
