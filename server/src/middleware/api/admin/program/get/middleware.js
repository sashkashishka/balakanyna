import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getProgramMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select()
    .from(programTable)
    .where(eq(programTable.id, searchParams.id));

  if (!result) {
    throw new ERR_NOT_FOUND();
  }

  ctx.json({
    id: result.id,
    name: result.name,
    userId: result.userId,
    startDatetime: result.startDatetime,
    expirationDatetime: result.expirationDatetime,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'get';
export const route = '/api/admin/program/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getProgramMiddleware,
]);
