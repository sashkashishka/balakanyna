import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };
import { verifyTaskConfigSchemaMiddleware } from '../schema/index.js';

const ERR_DIFFERENT_TASK_TYPE = createError(
  'DIFFERENT_TASK_TYPE',
  'Different task type',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTaskExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(eq(taskTable.id, body.id));

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
    .where(eq(taskTable.type, body.type));

  if (result?.count === 0) {
    throw new ERR_DIFFERENT_TASK_TYPE();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateTaskMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .update(taskTable)
    .set({
      name: body.name,
      config: body.config,
    })
    .where(eq(taskTable.id, body.id))
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    type: result.type,
    config: result.config,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/task/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfTaskExistsMiddleware,
  checkIfTaskTypeTheSameMiddleware,
  verifyTaskConfigSchemaMiddleware,
  updateTaskMiddleware,
]);
