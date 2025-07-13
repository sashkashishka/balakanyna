import { count, gt, eq } from 'drizzle-orm';

import { imageTable, labelTable, taskTable, userTable } from '../schema.js';

const CHUNK = 100;

/**
 * @argument {import('../index.js').IDb} db
 */
export async function postMigrate(db) {
  await Promise.all([
    postMigrateUsers(db),
    postMigrateLabels(db),
    postMigrateTasks(db),
    postMigrateImages(db),
  ]);
}

async function processInChunks({ chunk, total, fn }) {
  for (let i = 0; i < total; i += chunk) {
    await fn({ id: i, limit: chunk });
  }
}

/**
 * @argument {import('../index.js').IDb} db
 */
async function postMigrateUsers(db) {
  const [{ count: total }] = await db
    .select({ count: count(userTable.id) })
    .from(userTable);

  await processInChunks({
    chunk: CHUNK,
    total,
    async fn({ id, limit }) {
      const users = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          surname: userTable.surname,
        })
        .from(userTable)
        .where(gt(userTable.id, id))
        .orderBy(userTable.id)
        .limit(limit);

      for (const user of users) {
        await db
          .update(userTable)
          .set({
            name_normalized: user.name.toLowerCase(),
            surname_normalized: user.surname.toLowerCase(),
          })
          .where(eq(userTable.id, user.id));
      }
    },
  });
}

/**
 * @argument {import('../index.js').IDb} db
 */
async function postMigrateLabels(db) {
  const [{ count: total }] = await db
    .select({ count: count(labelTable.id) })
    .from(labelTable);

  await processInChunks({
    chunk: CHUNK,
    total,
    async fn({ id, limit }) {
      const labels = await db
        .select({
          id: labelTable.id,
          name: labelTable.name,
        })
        .from(labelTable)
        .where(gt(labelTable.id, id))
        .orderBy(labelTable.id)
        .limit(limit);

      for (const label of labels) {
        await db
          .update(labelTable)
          .set({
            name_normalized: label.name.toLowerCase(),
          })
          .where(eq(labelTable.id, label.id));
      }
    },
  });
}

/**
 * @argument {import('../index.js').IDb} db
 */
async function postMigrateTasks(db) {
  const [{ count: total }] = await db
    .select({ count: count(taskTable.id) })
    .from(taskTable);

  await processInChunks({
    chunk: CHUNK,
    total,
    async fn({ id, limit }) {
      const tasks = await db
        .select({
          id: taskTable.id,
          name: taskTable.name,
        })
        .from(taskTable)
        .where(gt(taskTable.id, id))
        .orderBy(taskTable.id)
        .limit(limit);

      for (const task of tasks) {
        await db
          .update(taskTable)
          .set({
            name_normalized: task.name.toLowerCase(),
          })
          .where(eq(taskTable.id, task.id));
      }
    },
  });
}

/**
 * @argument {import('../index.js').IDb} db
 */
async function postMigrateImages(db) {
  const [{ count: total }] = await db
    .select({ count: count(imageTable.id) })
    .from(imageTable);

  await processInChunks({
    chunk: CHUNK,
    total,
    async fn({ id, limit }) {
      const images = await db
        .select({
          id: imageTable.id,
          filename: imageTable.filename,
        })
        .from(imageTable)
        .where(gt(imageTable.id, id))
        .orderBy(imageTable.id)
        .limit(limit);

      for (const image of images) {
        await db
          .update(imageTable)
          .set({
            filename_normalized: image.filename.toLowerCase(),
          })
          .where(eq(imageTable.id, image.id));
      }
    },
  });
}
