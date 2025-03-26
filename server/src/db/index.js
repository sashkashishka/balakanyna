import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export async function getDb(dbUrl) {
  const sqlite = new Database(dbUrl);
  const db = drizzle({ client: sqlite });

  migrate(db, {
    migrationsFolder: path.resolve(import.meta.dirname, './migrations'),
  });

  return db;
}
