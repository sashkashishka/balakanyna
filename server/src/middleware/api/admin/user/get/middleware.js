import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { userTable } from '../../../../../db/schema.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getUserMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select()
    .from(userTable)
    .where(eq(userTable.id, searchParams.id));

  if (!result) {
    throw new ERR_NOT_FOUND();
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

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getUserMiddleware,
]);
