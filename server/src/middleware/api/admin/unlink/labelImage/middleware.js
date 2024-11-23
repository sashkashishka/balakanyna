import { and, count, eq } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
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
async function unlinkLabelImageMiddleware(ctx) {
  const { labelId, imageId } = ctx.body;

  await ctx.db
    .delete(labelImageTable)
    .where(
      and(
        eq(labelImageTable.imageId, imageId),
        eq(labelImageTable.labelId, labelId),
      ),
    );

  ctx.json({
    ok: true,
  });
}

export const method = 'post';
export const route = '/api/admin/unlink/label/image';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfLabelExistsMiddleware,
  checkIfImageExistsMiddleware,
  unlinkLabelImageMiddleware,
]);
