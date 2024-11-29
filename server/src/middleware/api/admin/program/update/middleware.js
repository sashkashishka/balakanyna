import { count, eq, inArray, sql } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  programTable,
  programTaskTable,
  taskTable,
} from '../../../../../db/schema.js';

import { programUpdateBodySchema } from './schema.js';
import { getUniqueTasks } from './utils.js';

const ERR_DATES_COMPLIANCE = createError(
  'DATES_COMPLIANCE',
  'Dates compliance',
  400,
);

const ERR_TASK_DOES_NOT_EXIST = createError(
  'TASK_DOES_NOT_EXIST',
  'Task does not exist',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfProgramExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(programTable.id) })
    .from(programTable)
    .where(eq(programTable.id, body.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfTasksExistMiddleware(ctx, next) {
  const body = ctx.body;

  const map = getUniqueTasks(body.tasks);
  const ids = [...map.values()].map(({ taskId }) => taskId);

  const [result] = await ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(inArray(taskTable.id, ids));

  if (result?.count !== ids.length) {
    throw new ERR_TASK_DOES_NOT_EXIST();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function verifyStartAndExpirationDatetimeComplianceMiddleware(ctx, next) {
  const body = ctx.body;

  const start = new Date(body.startDatetime);
  const expiration = new Date(body.expirationDatetime);

  if (start >= expiration) {
    throw new ERR_DATES_COMPLIANCE();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateProgramMiddleware(ctx) {
  const body = ctx.body;

  const result = await ctx.db.transaction(
    async function updateProgramTransaction(tx) {
      try {
        const [program] = await tx
          .update(programTable)
          .set({
            name: body.name,
            startDatetime: body.startDatetime,
            expirationDatetime: body.expirationDatetime,
            tasks: body.tasks,
            updatedAt: sql`(datetime())`,
          })
          .where(eq(programTable.id, body.id))
          .returning();

        await tx
          .delete(programTaskTable)
          .where(eq(programTaskTable.programId, body.id));

        const map = getUniqueTasks(body.tasks);
        const values = [...map.values()].map(({ taskId }) => ({
          taskId,
          programId: body.id,
        }));

        if (values.length) {
          await tx.insert(programTaskTable).values(values);
        }

        return program;
      } catch (e) {
        ctx.logger.error('[updateProgramTransaction]', e);
        tx.rollback();
      }
    },
  );

  ctx.json({
    id: result.id,
    name: result.name,
    startDatetime: result.startDatetime,
    expirationDatetime: result.expirationDatetime,
    userId: result.userId,
    tasks: result.tasks,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'patch';
export const route = '/api/admin/program/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(programUpdateBodySchema, ERR_INVALID_PAYLOAD),
  checkIfProgramExistsMiddleware,
  checkIfTasksExistMiddleware,
  verifyStartAndExpirationDatetimeComplianceMiddleware,
  updateProgramMiddleware,
]);
