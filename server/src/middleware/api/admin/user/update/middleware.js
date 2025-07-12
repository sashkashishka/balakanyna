import { count, eq, sql } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { userTable } from '../../../../../db/schema.js';

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
    .where(eq(userTable.id, body.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_USER_DOES_NOT_EXIST();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateUserMiddleware(ctx) {
  const body = ctx.body;

  const value = {
    id: body.id,
    name: body.name,
    surname: body.surname,
    grade: body.grade,
    notes: body.notes,
    email: body.email,
    phoneNumber: body.phoneNumber,
    messangers: body.messangers,
    birthdate: body.birthdate,
    updatedAt: sql`(datetime())`,
  };

  const [result] = await ctx.db
    .update(userTable)
    .set(value)
    .where(eq(userTable.id, body.id))
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    surname: result.surname,
    grade: result.grade,
    birthdate: result.birthdate,
    notes: result.notes,
    phoneNumber: result.phoneNumber,
    email: result.email,
    messangers: result.messangers,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'patch';
export const route = '/api/admin/user/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfUserExistsMiddleware,
  updateUserMiddleware,
]);
