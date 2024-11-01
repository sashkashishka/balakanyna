import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const adminTable = sqliteTable('admin', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  password: text().notNull(),
});

export const userTable = sqliteTable('user', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  surname: text().notNull(),
});

export const programTable = sqliteTable('program', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  userId: integer('user_id').references(() => userTable.id),
});

export const taskTable = sqliteTable('task', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  type: text({ enum: ['slider'] }).notNull(),
  config: text({ mode: 'json' }),
});

export const labelTable = sqliteTable('label', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const programTaskTable = sqliteTable('program_task', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  programId: integer('program_id').references(() => programTable.id),
  taskId: integer('task_id').references(() => taskTable.id),
});

export const taskLabelTable = sqliteTable('task_label', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  labelId: integer('label_id').references(() => labelTable.id),
  taskId: integer('task_id').references(() => taskTable.id),
});
