import { and, count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { labelTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_LABEL_DOES_NOT_EXIST = createError(
  'LABEL_DOES_NOT_EXIST',
  'Label does not exist',
  400,
);

const ERR_LABEL_WITH_SUCH_NAME_EXISTS = createError(
  'LABEL_WITH_SUCH_NAME_EXISTS',
  'Label with such name exists',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfLabelExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(labelTable.id) })
    .from(labelTable)
    .where(eq(labelTable.id, body.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_LABEL_DOES_NOT_EXIST();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfLabelNameExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const typeQuery = ctx.db
    .select({ type: labelTable.type })
    .from(labelTable)
    .where(eq(labelTable.id, body.id));

  const [result] = await ctx.db
    .select({ count: count(labelTable.id) })
    .from(labelTable)
    .where(and(eq(labelTable.type, typeQuery), eq(labelTable.name, body.name)));

  if (result?.count) {
    throw new ERR_LABEL_WITH_SUCH_NAME_EXISTS();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateLabelMiddleware(ctx) {
  const body = ctx.body;

  const value = {
    id: body.id,
    name: body.name,
    config: body.config,
    updatedAt: new Date().toISOString(),
  };

  const [result] = await ctx.db
    .update(labelTable)
    .set(value)
    .where(eq(labelTable.id, body.id))
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

export const method = 'patch';
export const route = '/api/admin/label/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfLabelExistsMiddleware,
  checkIfLabelNameExistsMiddleware,
  updateLabelMiddleware,
]);
