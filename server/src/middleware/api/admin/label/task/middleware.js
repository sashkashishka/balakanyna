import { and, count, eq } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_DUPLICATE_MANY_TO_MANY_RELATION,
} from '../../../../../core/errors.js';
import {
  labelTable,
  taskLabelTable,
  taskTable,
} from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_MISSING_ENTITY = createError('MISSING_ENTITY', 'Missing entity: %s', 400);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfLabelExistsMiddleware(ctx, next) {
  const { labelId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(labelTable.id) })
    .from(labelTable)
    .where(eq(labelTable.id, labelId))
    .limit(1);

  if (!result?.count) {
    throw new ERR_MISSING_ENTITY('label');
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTaskExistsMiddleware(ctx, next) {
  const { taskId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(eq(taskTable.id, taskId))
    .limit(1);

  if (!result?.count) {
    throw new ERR_MISSING_ENTITY('task');
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkDuplicateRowMiddleware(ctx, next) {
  const { labelId, taskId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(taskLabelTable.id) })
    .from(taskLabelTable)
    .where(
      and(
        eq(taskLabelTable.taskId, taskId),
        eq(taskLabelTable.labelId, labelId),
      ),
    )
    .limit(1);

  if (result?.count) {
    throw new ERR_DUPLICATE_MANY_TO_MANY_RELATION();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function labelTaskMiddleware(ctx) {
  const { labelId, taskId } = ctx.body;

  const [result] = await ctx.db
    .insert(taskLabelTable)
    .values({ taskId, labelId })
    .returning();

  ctx.json({
    id: result.id,
    labelId: result.labelId,
    taskId: result.taskId,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/label/task';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfLabelExistsMiddleware,
  checkIfTaskExistsMiddleware,
  checkDuplicateRowMiddleware,
  labelTaskMiddleware,
]);
