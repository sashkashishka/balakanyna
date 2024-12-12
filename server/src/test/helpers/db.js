import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

/**
 * @description
 * Copies existing db file with all migrations applied
 */
export async function setupDbFile() {
  const dbUrl = path.resolve(os.tmpdir(), 'balakanyna-test.db');
  await fsp.writeFile(dbUrl, '');
  return dbUrl;
}

/**
 * @description
 * Deletes db after test run
 */
export async function clearDbFile(dbUrl) {
  try {
    await fsp.rm(dbUrl);
  } catch (e) {
    console.log(e);
  }
}

export const dbStub = {
  $client: {
    close() {},
  },
};
