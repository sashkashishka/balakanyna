import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export async function getDb(dbUrl) {
  const sqlite = new Database(dbUrl);
  const db = drizzle({ client: sqlite });

  return db;
}
