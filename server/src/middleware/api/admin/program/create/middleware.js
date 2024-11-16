import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTable, userTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

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

  const [result] = await ctx.db
    .insert(programTable)
    .values({
      name: body.name,
      userId: body.userId,
      startDatetime: body.startDatetime,
      expirationDatetime: body.expirationDatetime,
    })
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    userId: result.userId,
    startDatetime: result.startDatetime,
    expirationDatetime: result.expirationDatetime,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/program/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfUserExistsMiddleware,
  createProgramMiddleware,
]);
