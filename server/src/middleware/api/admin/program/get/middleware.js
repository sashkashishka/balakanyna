import { eq } from 'drizzle-orm';

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

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getProgramMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const result = await ctx.db
    .select({
      id: programTable.id,
      name: programTable.name,
      userId: programTable.userId,
      startDatetime: programTable.startDatetime,
      expirationDatetime: programTable.expirationDatetime,
      createdAt: programTable.createdAt,
      updatedAt: programTable.updatedAt,
      task: {
        id: taskTable.id,
        name: taskTable.name,
        type: taskTable.type,
        config: taskTable.config,
        updatedAt: taskTable.updatedAt,
        createdAt: taskTable.createdAt,
      },
    })
    .from(programTable)
    .where(eq(programTable.id, searchParams.id))
    .leftJoin(programTaskTable, eq(programTable.id, programTaskTable.programId))
    .leftJoin(taskTable, eq(programTaskTable.taskId, taskTable.id));

  if (!result?.length) {
    throw new ERR_NOT_FOUND();
  }

  const program = result[0];
  const tasks = result.map(({ task }) => task).filter(Boolean);

  ctx.json({
    id: program.id,
    name: program.name,
    userId: program.userId,
    startDatetime: program.startDatetime,
    expirationDatetime: program.expirationDatetime,
    tasks,
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
  });
}

export const method = 'get';
export const route = '/api/admin/program/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getProgramMiddleware,
]);
