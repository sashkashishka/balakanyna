import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import { createError } from '../../../../../core/errors.js';
import { userTable } from '../../../../../db/schema.js';

const ERR_USER_DOES_NOT_EXIST = createError(
  'USER_DOES_NOT_EXIST',
  'User does not exist',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getUserMiddleware(ctx) {
  const { searchParams } = ctx.url;

  const [result] = await ctx.db
    .select()
    .from(userTable)
    .where(eq(userTable.id, searchParams.get('id') || 0));

  if (!result) {
    throw new ERR_USER_DOES_NOT_EXIST();
  }

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

export const method = 'get';
export const route = '/api/admin/user/get';

export const middleware = Composer.compose([getUserMiddleware]);
