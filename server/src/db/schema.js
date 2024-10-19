import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const adminTable = sqliteTable('admin', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  password: text().notNull(),
});
