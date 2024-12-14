import { eq, inArray } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskImageTable, taskTable } from '../../../../../db/schema.js';
import { sortJsonKeys } from '../../../../../utils/json.js';

import { verifyTaskConfigSchemaMiddleware } from '../schema/index.js';
import { getUniqueImageIds } from '../pipes/image.js';

import { taskCreateBodySchema } from './schema.js';

const ERR_DUPLICATE_TASK = createError('DUPLICATE_TASK', '%s', 400);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkDuplicateConfigurationMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ id: taskTable.id })
    .from(taskTable)
    .where(eq(taskTable.config, sortJsonKeys(body.config)))
    .limit(1);

  if (result?.id) {
    throw new ERR_DUPLICATE_TASK(result.id);
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function createTaskMiddleware(ctx) {
  const body = ctx.body;

  const task = await ctx.db.transaction(
    async function createTaskTransaction(tx) {
      try {
        const [result] = await tx
          .insert(taskTable)
          .values({
            name: body.name,
            type: body.type,
            config: sortJsonKeys(body.config),
          })
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
          place: '[createTaskTransaction]',
        });
        tx.rollback();
      }
    },
  );

  ctx.json({
    id: task.id,
    name: task.name,
    type: task.type,
    config: task.config,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/task/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(taskCreateBodySchema, ERR_INVALID_PAYLOAD),
  verifyTaskConfigSchemaMiddleware,
  checkDuplicateConfigurationMiddleware,
  createTaskMiddleware,
]);
