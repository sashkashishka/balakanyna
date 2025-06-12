import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTable, userTable } from '../../../../../db/schema.js';

import { programCreateBodySchema } from './schema.js';

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
async function createProgramMiddleware(ctx) {
  const body = ctx.body;

  const result = await ctx.db.transaction(
    async function createProgramTransaction(tx) {
      try {
        const [raw] = await tx
          .insert(programTable)
          .values({
            hash: '',
            name: body.name,
            userId: body.userId,
            startDatetime: body.startDatetime,
            expirationDatetime: body.expirationDatetime,
          })
          .returning();

        const [program] = await tx
          .update(programTable)
          .set({
            hash: ctx.hash.update(JSON.stringify(raw)),
          })
          .where(eq(programTable.id, raw.id))
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
    tasks: [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/program/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(programCreateBodySchema, ERR_INVALID_PAYLOAD),
  checkIfUserExistsMiddleware,
  createProgramMiddleware,
]);
