import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { labelTable } from '../../../../../db/schema.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getLabelMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select()
    .from(labelTable)
    .where(eq(labelTable.id, searchParams.id));

  if (!result) {
    throw new ERR_NOT_FOUND();
  }

  ctx.json({
    id: result.id,
    name: result.name,
    type: result.type,
    config: result.config,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'get';
export const route = '/api/admin/label/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getLabelMiddleware,
]);
