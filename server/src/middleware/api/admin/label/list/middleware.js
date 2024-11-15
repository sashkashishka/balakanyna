import { and, asc, desc, like } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { labelTable } from '../../../../../db/schema.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };

const direction = {
  asc,
  desc,
};

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function labelListMiddleware(ctx) {
  const { limit, offset, order_by, dir, name } = ctx.searchParams;

  const andClauses = [];

  if (name) {
    andClauses.push(like(labelTable.name, `%${name}%`));
  }

  let query = ctx.db
    .select()
    .from(labelTable)
    .orderBy(direction[dir](labelTable[order_by]));

  if (andClauses.length) {
    query = query.where(and(...andClauses));
  }

  const result = await query.limit(limit).offset(offset);

  ctx.json(result);
}

export const method = 'get';
export const route = '/api/admin/label/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, schema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  labelListMiddleware,
]);
