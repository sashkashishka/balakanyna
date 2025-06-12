import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  imageTable,
  taskImageTable,
  taskTable,
} from '../../../../../db/schema.js';
import { createTransformTask } from '../../../admin/task/pipes/task.js';

import { clientTaskGetSearchParamsSchema } from './schema.js';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkTaskExists(ctx, next) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(eq(taskTable.hash, searchParams.id));

  if (!result?.count) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getTaskMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const result = await ctx.db
    .select({
      hash: taskTable.hash,
      type: taskTable.type,
      config: taskTable.config,
      image: {
        id: imageTable.id,
        path: imageTable.path,
      },
    })
    .from(taskTable)
    .where(eq(taskTable.hash, searchParams.id))
    .leftJoin(taskImageTable, eq(taskTable.id, taskImageTable.taskId))
    .leftJoin(imageTable, eq(taskImageTable.imageId, imageTable.id));

  const transformTask = createTransformTask(ctx);
  const [task] = transformTask(result);

  ctx.json({
    id: task.hash,
    type: task.type,
    config: task.config,
  });
}

export const method = 'get';
export const route = '/api/client/task/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    clientTaskGetSearchParamsSchema,
    ERR_INVALID_PAYLOAD,
  ),
  checkTaskExists,
  getTaskMiddleware,
]);
