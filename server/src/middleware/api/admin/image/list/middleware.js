import {
  and,
  asc,
  desc,
  gte,
  inArray,
  count,
  like,
  lte,
  eq,
} from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import {
  imageTable,
  labelImageTable,
  labelTable,
} from '../../../../../db/schema.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };
import { addPrefixToPathname } from '../../../../../utils/network.js';

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
    labels,
  } = ctx.searchParams;

  const andClauses = [];

  if (min_created_at) {
    andClauses.push(gte(imageTable.createdAt, min_created_at));
  }

  if (max_created_at) {
    andClauses.push(lte(imageTable.createdAt, max_created_at));
  }

  if (filename) {
    andClauses.push(like(imageTable.filename_normalized, `%${filename.toLowerCase()}%`));
  }

  if (labels) {
    andClauses.push(
      inArray(
        imageTable.id,
        ctx.db
          .select({ imageId: labelImageTable.imageId })
          .from(labelImageTable)
          .where(inArray(labelImageTable.labelId, labels)),
      ),
    );
  }

  const imagesSq = ctx.db
    .select()
    .from(imageTable)
    .orderBy(direction[dir](imageTable[order_by]))
    .where(and(...andClauses))
    .limit(limit)
    .offset(offset)
    .as('imagesSq');

  const query = ctx.db
    .select({
      id: imagesSq.id,
      filename: imagesSq.filename,
      hashsum: imagesSq.hashsum,
      path: imagesSq.path,
      createdAt: imagesSq.createdAt,
      updatedAt: imagesSq.updatedAt,
      label: {
        id: labelTable.id,
        name: labelTable.name,
        type: labelTable.type,
        config: labelTable.config,
        updatedAt: labelTable.updatedAt,
        createdAt: labelTable.createdAt,
      },
    })
    .from(imagesSq)
    .leftJoin(labelImageTable, eq(imagesSq.id, labelImageTable.imageId))
    .leftJoin(labelTable, eq(labelImageTable.labelId, labelTable.id));

  const countQuery = ctx.db
    .select({ count: count(imageTable.id) })
    .from(imageTable)
    .where(and(...andClauses));

  const [items, [total]] = await Promise.all([query, countQuery]);

  const itemsMap = items.reduce((acc, curr) => {
    const { id } = curr;

    if (!acc.has(id)) {
      acc.set(id, {
        id,
        filename: curr.filename,
        hashsum: curr.hashsum,
        path: addPrefixToPathname(curr.path, ctx.config.media.prefix),
        createdAt: curr.createdAt,
        updatedAt: curr.updatedAt,
        labels: [],
      });
    }

    if (curr.label) {
      acc.get(id).labels.push(curr.label);
    }

    return acc;
  }, new Map());

  ctx.json({
    items: [...itemsMap.values()],
    total: total.count,
  });
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
