import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * @description
 * Creates a db file with all migrations applied
 * It will be copied for test runs to avoid running
 * migrate script for each run
 */
export function getTmpDbUrl() {
  return path.join(os.tmpdir(), `balakanyna-test-${Date.now()}.db`);
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

/**
 * @description
 * Copies existing db file with all migrations applied
 */
export async function setupDb(dbUrl) {
  const dbCopyUrl = path.resolve(os.tmpdir(), 'b.db');
  await fs.copyFile(dbUrl, dbCopyUrl);

  return dbCopyUrl;
}

/**
 * @description
 * Deletes copied db after test run
 */
export async function clearDb(dbUrl) {
  await fs.rm(dbUrl);
}

export const dbStub = {
  $client: {
    close() {},
  },
};
