import { and, count, eq } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import {
  labelTable,
  taskLabelTable,
  taskTable,
} from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_MISSING_ENTITY = createError(
  'MISSING_ENTITY',
  'Missing entity: %s',
  400,
);

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
async function unlinkLabelTaskMiddleware(ctx) {
  const { labelId, taskId } = ctx.body;

  await ctx.db
    .delete(taskLabelTable)
    .where(
      and(
        eq(taskLabelTable.labelId, labelId),
        eq(taskLabelTable.taskId, taskId),
      ),
    );

  ctx.json({
    ok: true,
  });
}

export const method = 'post';
export const route = '/api/admin/unlink/label/task';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfLabelExistsMiddleware,
  checkIfTaskExistsMiddleware,
  unlinkLabelTaskMiddleware,
]);
