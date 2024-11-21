import { and, count, asc, desc, gte, like, lte } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { userTable } from '../../../../../db/schema.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };

const direction = {
  asc,
  desc,
};

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function userListMiddleware(ctx) {
  const {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    min_birthdate,
    max_birthdate,
    min_grade,
    max_grade,
    name,
  } = ctx.searchParams;

  const andClauses = [];

  if (min_created_at) {
    andClauses.push(gte(userTable.createdAt, min_created_at));
  }

  if (max_created_at) {
    andClauses.push(lte(userTable.createdAt, max_created_at));
  }

  if (min_birthdate) {
    andClauses.push(gte(userTable.birthdate, min_birthdate));
  }

  if (max_birthdate) {
    andClauses.push(lte(userTable.birthdate, max_birthdate));
  }

  if (min_grade) {
    andClauses.push(gte(userTable.grade, min_grade));
  }

  if (max_grade) {
    andClauses.push(lte(userTable.grade, max_grade));
  }

  if (name) {
    andClauses.push(like(userTable.name, `%${name}%`));
  }

  let query = ctx.db
    .select()
    .from(userTable)
    .orderBy(direction[dir](userTable[order_by]));

  let countQuery = ctx.db
    .select({ count: count(userTable.id) })
    .from(userTable);

  if (andClauses.length) {
    query = query.where(and(...andClauses));
    countQuery = countQuery.where(and(...andClauses));
  }

  const [items, [total]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  ctx.json({ items, total: total.count });
}

export const method = 'get';
export const route = '/api/admin/user/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, schema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  userListMiddleware,
]);
