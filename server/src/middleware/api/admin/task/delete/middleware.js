import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_DELETE_RELATION,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTaskTable, taskTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @TODO: candidate to moving in a common space to share with the update
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTaskExistsMiddleware(ctx, next) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(eq(taskTable.id, searchParams.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfCanDeleteTaskMiddleware(ctx, next) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select({ count: count(programTaskTable.id) })
    .from(programTaskTable)
    .where(eq(programTaskTable.taskId, searchParams.id));

  if (result?.count) {
    throw new ERR_DELETE_RELATION();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function deleteTaskMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  await ctx.db.delete(taskTable).where(eq(taskTable.id, searchParams.id));

  ctx.json({
    ok: true,
  });
}

export const method = 'delete';
export const route = '/api/admin/task/delete';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfTaskExistsMiddleware,
  checkIfCanDeleteTaskMiddleware,
  deleteTaskMiddleware,
]);
