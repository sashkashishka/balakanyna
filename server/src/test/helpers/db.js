import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export function getTmpDbUrl() {
  return path.join(os.tmpdir(), 'balakanyna-test.db');
}

export function runTestMigration(dbUrl) {
  process.env.DATABASE_URL = dbUrl;

  const { resolve, reject, promise } = Promise.withResolvers();

  const proc = exec(`pnpm -F server run drizzle migrate`, (err) => {
    if (err) {
      reject(err);
    }

    resolve();
  });

  if (process.env.DEBUG) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
  }

  return promise;
}

export async function clearDb(dbUrl) {
  await fs.rm(dbUrl);
}
