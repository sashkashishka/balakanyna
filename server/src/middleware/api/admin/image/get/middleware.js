import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import {
  imageTable,
  labelImageTable,
  labelTable,
} from '../../../../../db/schema.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getImageMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const result = await ctx.db
    .select({
      id: imageTable.id,
      filename: imageTable.filename,
      hashsum: imageTable.hashsum,
      path: imageTable.path,
      createdAt: imageTable.createdAt,
      updatedAt: imageTable.updatedAt,
      label: {
        id: labelTable.id,
        name: labelTable.name,
        type: labelTable.type,
        config: labelTable.config,
        updatedAt: labelTable.updatedAt,
        createdAt: labelTable.createdAt,
      },
    })
    .from(imageTable)
    .where(eq(imageTable.id, searchParams.id))
    .leftJoin(labelImageTable, eq(imageTable.id, labelImageTable.imageId))
    .leftJoin(labelTable, eq(labelImageTable.labelId, labelTable.id));

  if (!result?.length) {
    throw new ERR_NOT_FOUND();
  }

  const image = result[0];
  const labels = result.map(({ label }) => label).filter(Boolean);

  ctx.json({
    id: image.id,
    filename: image.filename,
    hashsum: image.hashsum,
    path: image.path,
    labels,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  });
}

export const method = 'get';
export const route = '/api/admin/image/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getImageMiddleware,
]);
