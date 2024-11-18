import { and, asc, desc, eq, gte, inArray, like, lte } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { imageTable, labelImageTable } from '../../../../../db/schema.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };

const direction = {
  asc,
  desc,
};

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function imageListMiddleware(ctx) {
  const {
    limit,
    offset,
    order_by,
    dir,
    filename,
    min_created_at,
    max_created_at,
    label,
  } = ctx.searchParams;

  const andClauses = [];

  if (min_created_at) {
    andClauses.push(gte(imageTable.createdAt, min_created_at));
  }

  if (max_created_at) {
    andClauses.push(lte(imageTable.createdAt, max_created_at));
  }

  if (filename) {
    andClauses.push(like(imageTable.filename, `%${filename}%`));
  }

  if (label) {
    andClauses.push(
      inArray(
        imageTable.id,
        ctx.db
          .select({ imageId: labelImageTable.imageId })
          .from(labelImageTable)
          .where(inArray(labelImageTable.labelId, label)),
      ),
    );
  }

  let query = ctx.db
    .select()
    .from(imageTable)
    .orderBy(direction[dir](imageTable[order_by]));

  if (andClauses.length) {
    query = query.where(and(...andClauses));
  }

  const result = await query.limit(limit).offset(offset);

  ctx.json(result);
}

export const method = 'get';
export const route = '/api/admin/image/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, schema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  imageListMiddleware,
]);
