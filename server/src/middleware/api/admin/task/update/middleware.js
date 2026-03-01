import { and, count, eq, not, sql } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskImageTable, taskTable } from '../../../../../db/schema.js';

import { verifyTaskConfigSchemaMiddleware } from '../schema/index.js';
import { sortJsonKeys } from '../../../../../utils/json.js';
import { getUniqueImageIds } from '../pipes/image.js';

import { taskUpdateBodySchema } from './schema.js';

const ERR_DIFFERENT_TASK_TYPE = createError(
  'DIFFERENT_TASK_TYPE',
  'Different task type',
  400,
);

const ERR_DUPLICATE_TASK = createError('DUPLICATE_TASK', '%s', 400);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTaskExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(eq(taskTable.id, body.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTaskTypeTheSameMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(and(eq(taskTable.id, body.id), eq(taskTable.type, body.type)))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_DIFFERENT_TASK_TYPE();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkDuplicateConfigurationMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ id: taskTable.id })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.config, sortJsonKeys(body.config)),
        not(eq(taskTable.id, body.id)),
      ),
    )
    .limit(1);

  if (result?.id) {
    throw new ERR_DUPLICATE_TASK(result.id);
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateTaskMiddleware(ctx) {
  const body = ctx.body;

  const task = await ctx.db.transaction(
    async function updateTaskTransaction(tx) {
      try {
        const [result] = await ctx.db
          .update(taskTable)
          .set({
            name: body.name,
            name_normalized: body.name.toLowerCase(),
            config: sortJsonKeys(body.config),
            updatedAt: sql`(datetime())`,
          })
          .where(eq(taskTable.id, body.id))
          .returning();

        const imageIds = getUniqueImageIds(result);

        if (imageIds.length) {
          await tx
            .delete(taskImageTable)
            .where(eq(taskImageTable.taskId, body.id));

          const values = imageIds.map((imageId) => ({
            imageId,
            taskId: body.id,
          }));

          await tx.insert(taskImageTable).values(values);
        }

        return result;
      } catch (err) {
        ctx.logger.error({
          err,
          place: '[updateTaskTransaction]',
        });
        tx.rollback();
      }
    },
  );

  ctx.json({
    id: task.id,
    hash: task.hash,
    name: task.name,
    name_normalized: task.name_normalized,
    type: task.type,
    config: task.config,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}

export const method = 'patch';
export const route = '/api/admin/task/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(taskUpdateBodySchema, ERR_INVALID_PAYLOAD),
  checkIfTaskExistsMiddleware,
  checkIfTaskTypeTheSameMiddleware,
  verifyTaskConfigSchemaMiddleware,
  checkDuplicateConfigurationMiddleware,
  updateTaskMiddleware,
]);
