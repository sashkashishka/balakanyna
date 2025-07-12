import { or, like } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { userTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function userSearchMiddleware(ctx) {
  const { search } = ctx.searchParams;

  const result = await ctx.db
    .select()
    .from(userTable)
    .where(
      or(
        like(userTable.name_normalized, `%${search.toLowerCase()}%`),
        like(userTable.surname_normalized, `%${search.toLowerCase()}%`),
      ),
    )
    .limit(ctx.config.search.limit);

  ctx.json(result);
}

export const method = 'get';
export const route = '/api/admin/user/search';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  userSearchMiddleware,
]);
