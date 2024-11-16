import { and, count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { userTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_DUPLICATE_USER = createError('DUPLICATE_USER', 'Duplicate user', 400);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(userTable.id) })
    .from(userTable)
    .where(
      and(eq(userTable.name, body.name), eq(userTable.surname, body.surname)),
    )
    .limit(1);

  if (result?.count) {
    throw new ERR_DUPLICATE_USER();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function createUserMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .insert(userTable)
    .values({
      name: body.name,
      surname: body.surname,
      grade: body.grade,
      birthdate: body.birthdate,
      notes: body.notes,
      phoneNumber: body.phoneNumber,
      email: body.email,
      messangers: body.messangers,
    })
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

export const method = 'post';
export const route = '/api/admin/user/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfDuplicateMiddleware,
  createUserMiddleware,
]);
