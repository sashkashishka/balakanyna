import { and, count, eq, gt } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  programTable,
  programTaskTable,
  taskTable,
} from '../../../../../db/schema.js';

import { clientProgramGetSearchParams } from './schema.js';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkProgramExists(ctx, next) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(programTable)
    .where(
      and(
        eq(programTable.hash, searchParams.id),
        gt(programTable.expirationDatetime, new Date().toISOString()),
      ),
    );

  if (!result?.count) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getProgramMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const result = await ctx.db
    .select({
      id: programTable.id,
      hash: programTable.hash,
      tasks: programTable.tasks,
      task: {
        id: taskTable.id,
        hash: taskTable.hash,
      },
    })
    .from(programTable)
    .where(eq(programTable.hash, searchParams.id))
    .leftJoin(programTaskTable, eq(programTable.id, programTaskTable.programId))
    .leftJoin(taskTable, eq(programTaskTable.taskId, taskTable.id));

  const program = result[0];
  const tasks = result.map(({ task }) => task).filter((task) => task?.id);

  ctx.json({
    hash: program.hash,
    tasks: program.tasks
      .map(({ taskId }) => tasks.find((t) => t.id === taskId))
      .map(({ hash }) => ({ hash })),
  });
}

export const method = 'get';
export const route = '/api/client/program/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    clientProgramGetSearchParams,
    ERR_INVALID_PAYLOAD,
  ),
  checkProgramExists,
  getProgramMiddleware,
]);
