import path from 'node:path';
import fs from 'node:fs/promises';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

async function postMigrate(db) {
  const dir = path.resolve(import.meta.dirname, './post-migrations');
  const files = await fs.readdir(dir);

  for (const file of files) {
    const { postMigrate } = await import(path.resolve(dir, file));

    await postMigrate(db);
  }
}

export async function getDb(dbUrl) {
  const sqlite = new Database(dbUrl);
  const db = drizzle({ client: sqlite });

  migrate(db, {
    migrationsFolder: path.resolve(import.meta.dirname, './migrations'),
  });

  await postMigrate(db);

  return db;
}
