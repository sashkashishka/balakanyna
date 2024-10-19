import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { Database } from 'better-sqlite3';

export interface IDb extends BetterSQLite3Database {
  $client: Database;
}

export function getDb(dbUrl: string): Promise<IDb>;
