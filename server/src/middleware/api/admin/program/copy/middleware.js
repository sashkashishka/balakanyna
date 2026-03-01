import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  programTable,
  programTaskTable,
  userTable,
} from '../../../../../db/schema.js';

import {
  checkIfProgramExistsMiddleware,
  verifyStartAndExpirationDatetimeComplianceMiddleware,
} from '../update/middleware.js';
import { programCopyBodySchema } from './schema.js';
import { getUniqueTasks } from '../update/utils.js';

const ERR_USER_DOES_NOT_EXIST = createError(
  'USER_DOES_NOT_EXIST',
  'User does not exist',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfUserExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(userTable.id) })
    .from(userTable)
    .where(eq(userTable.id, body.userId))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_USER_DOES_NOT_EXIST();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function copyProgramMiddleware(ctx) {
  const body = ctx.body;

  const result = await ctx.db.transaction(
    async function copyProgramTransaction(tx) {
      try {
        const [donor] = await tx
          .select()
          .from(programTable)
          .where(eq(programTable.id, body.id));

        const [recipient] = await tx
          .insert(programTable)
          .values({
            hash: '',
            tasks: donor.tasks,
            name: donor.name,
            userId: body.userId,
            startDatetime: body.startDatetime,
            expirationDatetime: body.expirationDatetime,
          })
          .returning();

        const map = getUniqueTasks(donor.tasks);
        const values = [...map.values()].map(({ taskId }) => ({
          taskId,
          programId: recipient.id,
        }));

        if (values.length) {
          await tx.insert(programTaskTable).values(values);
        }

        const [program] = await tx
          .update(programTable)
          .set({
            hash: ctx.hash.update(JSON.stringify(recipient)),
          })
          .where(eq(programTable.id, recipient.id))
          .returning();

        return program;
      } catch (err) {
        ctx.logger.error({
          err,
          place: '[createProgramTransaction]',
        });
        tx.rollback();
      }
    },
  );

  ctx.json({
    id: result.id,
    hash: result.hash,
    name: result.name,
    userId: result.userId,
    startDatetime: result.startDatetime,
    expirationDatetime: result.expirationDatetime,
    tasks: result.tasks,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/program/copy';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(programCopyBodySchema, ERR_INVALID_PAYLOAD),
  checkIfUserExistsMiddleware,
  checkIfProgramExistsMiddleware,
  verifyStartAndExpirationDatetimeComplianceMiddleware,
  copyProgramMiddleware,
]);
