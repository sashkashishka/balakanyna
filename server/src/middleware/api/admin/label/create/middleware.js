import { and, count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { labelTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_DUPLICATE_LABEL = createError(
  'DUPLICATE_LABEL',
  'Duplicate label',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(labelTable.id) })
    .from(labelTable)
    .where(and(eq(labelTable.name, body.name), eq(labelTable.type, body.type)))
    .limit(1);

  if (result?.count) {
    throw new ERR_DUPLICATE_LABEL();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function createLabelMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .insert(labelTable)
    .values({
      name: body.name,
      type: body.type,
      config: body.config,
    })
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    type: result.type,
    config: result.config,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/label/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfDuplicateMiddleware,
  createLabelMiddleware,
]);
