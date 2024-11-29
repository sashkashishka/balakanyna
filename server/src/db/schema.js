import { sql } from 'drizzle-orm';
import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text().default(sql`(datetime('now'))`),
  updatedAt: text().default(sql`(datetime('now'))`),
};

export const adminTable = sqliteTable('admin', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  password: text().notNull(),
  ...timestamps,
});

export const userTable = sqliteTable('user', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  surname: text().notNull(),
  grade: integer({ mode: 'number' }).notNull(),
  birthdate: text().notNull(),
  notes: text(),
  phoneNumber: text(),
  email: text(),
  messangers: text(),
  ...timestamps,
});

export const programTable = sqliteTable('program', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  userId: integer('user_id').references(() => userTable.id),
  startDatetime: text().default(sql`(datetime('now'))`),
  expirationDatetime: text().default(sql`(datetime('now'))`),
  tasks: text({ mode: 'json' }).default(sql`(json_array())`),
  ...timestamps,
});

export const taskTable = sqliteTable('task', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text({ enum: ['imageSlider', 'semaphoreText'] }).notNull(),
  config: text({ mode: 'json' }),
  ...timestamps,
});

export const labelTable = sqliteTable('label', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  type: text({ enum: ['image', 'task'] }).notNull(),
  name: text().notNull(),
  config: text({ mode: 'json' }).notNull(),
  ...timestamps,
});

export const imageTable = sqliteTable('image', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  filename: text().notNull(),
  path: text().notNull(),
  hashsum: text().notNull(),
  ...timestamps,
});

export const programTaskTable = sqliteTable('program_task', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  programId: integer('program_id').references(() => programTable.id),
  taskId: integer('task_id').references(() => taskTable.id),
  ...timestamps,
});

export const taskLabelTable = sqliteTable('task_label', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  labelId: integer('label_id').references(() => labelTable.id),
  taskId: integer('task_id').references(() => taskTable.id),
  ...timestamps,
});

export const labelImageTable = sqliteTable('label_image', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  imageId: integer('image_id').references(() => imageTable.id),
  labelId: integer('label_id').references(() => labelTable.id),
  ...timestamps,
});
