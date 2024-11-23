import { and, count, eq } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import {
  programTable,
  taskTable,
  programTaskTable,
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
async function checkIfProgramExistsMiddleware(ctx, next) {
  const { programId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(programTable.id) })
    .from(programTable)
    .where(eq(programTable.id, programId))
    .limit(1);

  if (!result?.count) {
    throw new ERR_MISSING_ENTITY('program');
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
async function unlinkTaskProgramMiddleware(ctx) {
  const { programId, taskId } = ctx.body;

  await ctx.db
    .delete(programTaskTable)
    .where(
      and(
        eq(programTaskTable.taskId, taskId),
        eq(programTaskTable.programId, programId),
      ),
    );

  ctx.json({
    ok: true,
  });
}

export const method = 'post';
export const route = '/api/admin/unlink/task/program';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfProgramExistsMiddleware,
  checkIfTaskExistsMiddleware,
  unlinkTaskProgramMiddleware,
]);
