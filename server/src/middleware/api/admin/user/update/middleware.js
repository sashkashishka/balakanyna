import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import { createError, ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { userTable } from '../../../../../db/schema.js';

const ERR_USER_DOES_NOT_EXIST = createError(
  'USER_DOES_NOT_EXIST',
  'User does not exist',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function validateUserUpdateBodyMiddleware(ctx, next) {
  const body = ctx.body;

  if (
    body &&
    body?.id &&
    typeof body?.id === 'number' &&
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
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfUserExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(userTable.id) })
    .from(userTable)
    .where(eq(userTable.id, body.id));

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

  const [result] = await ctx.db
    .update(userTable)
    .set({
      name: body.name,
      surname: body.surname,
    })
    .where(eq(userTable.id, body.id))
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    surname: result.surname,
  });
}

export const method = 'post';
export const route = '/api/admin/user/update';

export const middleware = Composer.compose([
  validateUserUpdateBodyMiddleware,
  checkIfUserExistsMiddleware,
  updateUserMiddleware,
]);
