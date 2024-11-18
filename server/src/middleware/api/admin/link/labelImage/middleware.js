import { and, count, eq } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_DUPLICATE_MANY_TO_MANY_RELATION,
} from '../../../../../core/errors.js';
import {
  labelTable,
  labelImageTable,
  imageTable,
} from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_MISSING_ENTITY = createError(
  'MISSING_ENTITY',
  'Missing entity: %s',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfLabelExistsMiddleware(ctx, next) {
  const { labelId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(labelTable.id) })
    .from(labelTable)
    .where(eq(labelTable.id, labelId))
    .limit(1);

  if (!result?.count) {
    throw new ERR_MISSING_ENTITY('label');
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfImageExistsMiddleware(ctx, next) {
  const { imageId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(imageTable.id) })
    .from(imageTable)
    .where(eq(imageTable.id, imageId))
    .limit(1);

  if (!result?.count) {
    throw new ERR_MISSING_ENTITY('image');
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkDuplicateRowMiddleware(ctx, next) {
  const { labelId, imageId } = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(labelImageTable.id) })
    .from(labelImageTable)
    .where(
      and(
        eq(labelImageTable.imageId, imageId),
        eq(labelImageTable.labelId, labelId),
      ),
    )
    .limit(1);

  if (result?.count) {
    throw new ERR_DUPLICATE_MANY_TO_MANY_RELATION();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function linkLabelImageMiddleware(ctx) {
  const { labelId, imageId } = ctx.body;

  const [result] = await ctx.db
    .insert(labelImageTable)
    .values({ imageId, labelId })
    .returning();

  ctx.json({
    id: result.id,
    labelId: result.labelId,
    imageId: result.imageId,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'post';
export const route = '/api/admin/link/label/image';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfLabelExistsMiddleware,
  checkIfImageExistsMiddleware,
  checkDuplicateRowMiddleware,
  linkLabelImageMiddleware,
]);
