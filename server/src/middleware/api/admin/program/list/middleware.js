import { and, asc, desc, gte, count, inArray, like, lte } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import {
  programTable,
} from '../../../../../db/schema.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };

const direction = {
  asc,
  desc,
};

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function programListMiddleware(ctx) {
  const {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    min_updated_at,
    max_updated_at,
    min_start_datetime,
    max_start_datetime,
    min_expiration_datetime,
    max_expiration_datetime,
    ids,
    userIds,
    name,
  } = ctx.searchParams;

  const andClauses = [];

  if (min_created_at) {
    andClauses.push(gte(programTable.createdAt, min_created_at));
  }

  if (max_created_at) {
    andClauses.push(lte(programTable.createdAt, max_created_at));
  }

  if (min_updated_at) {
    andClauses.push(gte(programTable.createdAt, min_updated_at));
  }

  if (max_updated_at) {
    andClauses.push(lte(programTable.createdAt, max_updated_at));
  }

  if (min_start_datetime) {
    andClauses.push(gte(programTable.startDatetime, min_start_datetime));
  }

  if (max_start_datetime) {
    andClauses.push(lte(programTable.startDatetime, max_start_datetime));
  }

  if (min_expiration_datetime) {
    andClauses.push(
      gte(programTable.expirationDatetime, min_expiration_datetime),
    );
  }

  if (max_expiration_datetime) {
    andClauses.push(
      lte(programTable.expirationDatetime, max_expiration_datetime),
    );
  }

  if (name) {
    andClauses.push(like(programTable.name, `%${name}%`));
  }

  if (ids) {
    andClauses.push(inArray(programTable.id, ids));
  }

  if (userIds) {
    andClauses.push(inArray(programTable.userId, userIds));
  }

  const query = ctx.db
    .select()
    .from(programTable)
    .orderBy(direction[dir](programTable[order_by]))
    .where(and(...andClauses))
    .limit(limit)
    .offset(offset);

  const countQuery = ctx.db
    .select({ count: count(programTable.id) })
    .from(programTable)
    .where(and(...andClauses));

  const [items, [total]] = await Promise.all([query, countQuery]);

  ctx.json({
    items,
    total: total.count,
  });
}

export const method = 'get';
export const route = '/api/admin/program/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, schema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  programListMiddleware,
]);
