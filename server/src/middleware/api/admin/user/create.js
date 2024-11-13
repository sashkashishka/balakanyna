import { and, count, eq } from 'drizzle-orm';

import { Composer } from '../../../../core/composer.js';
import { createError, ERR_INVALID_PAYLOAD } from '../../../../core/errors.js';
import { userTable } from '../../../../db/schema.js';

const ERR_DUPLICATE_USER = createError('DUPLICATE_USER', 'Duplicate user', 400);

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
function validateUserCreateBodyMiddleware(ctx, next) {
  const body = ctx.body;

  if (
    body &&
    body?.name &&
    typeof body?.name === 'string' &&
    body?.surname &&
    typeof body?.surname === 'string'
  ) {
    return next();
  }

  throw new ERR_INVALID_PAYLOAD();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(userTable.id) })
    .from(userTable)
    .where(
      and(eq(userTable.name, body.name), eq(userTable.surname, body.surname)),
    );

  if (result?.count) {
    throw new ERR_DUPLICATE_USER();
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function createUserMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .insert(userTable)
    .values({
      name: body.name,
      surname: body.surname,
    })
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    surname: result.surname,
  });
}

export const method = 'post';
export const route = '/api/admin/user/create';

export const middleware = Composer.compose([
  validateUserCreateBodyMiddleware,
  checkIfDuplicateMiddleware,
  createUserMiddleware,
]);
