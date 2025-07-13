import {
  and,
  asc,
  desc,
  gte,
  count,
  inArray,
  like,
  lte,
  eq,
} from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import {
  taskTable,
  taskLabelTable,
  programTaskTable,
  programTable,
  labelTable,
  taskImageTable,
  imageTable,
} from '../../../../../db/schema.js';
import { createTransformTask } from '../pipes/task.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import { taskListSearchParamsSchema } from './schema.js';

const direction = {
  asc,
  desc,
};

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function taskListMiddleware(ctx) {
  const {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    min_updated_at,
    max_updated_at,
    ids,
    userIds,
    programIds,
    types,
    labels,
    name,
  } = ctx.searchParams;

  const andClauses = [];

  if (min_created_at) {
    andClauses.push(gte(taskTable.createdAt, min_created_at));
  }

  if (max_created_at) {
    andClauses.push(lte(taskTable.createdAt, max_created_at));
  }

  if (min_updated_at) {
    andClauses.push(gte(taskTable.createdAt, min_updated_at));
  }

  if (max_updated_at) {
    andClauses.push(lte(taskTable.createdAt, max_updated_at));
  }

  if (name) {
    andClauses.push(like(taskTable.name_normalized, `%${name.toLowerCase()}%`));
  }

  if (types) {
    andClauses.push(inArray(taskTable.type, types));
  }

  if (ids) {
    andClauses.push(inArray(taskTable.id, ids));
  }

  if (userIds) {
    andClauses.push(
      inArray(
        taskTable.id,
        ctx.db
          .select({ taskId: programTaskTable.taskId })
          .from(programTaskTable)
          .where(
            inArray(
              programTaskTable.programId,
              ctx.db
                .select({ programId: programTable.id })
                .from(programTable)
                .where(inArray(programTable.userId, userIds)),
            ),
          ),
      ),
    );
  }

  if (programIds) {
    andClauses.push(
      inArray(
        taskTable.id,
        ctx.db
          .select({ taskId: programTaskTable.taskId })
          .from(programTaskTable)
          .where(inArray(programTaskTable.programId, programIds)),
      ),
    );
  }

  if (labels) {
    andClauses.push(
      inArray(
        taskTable.id,
        ctx.db
          .select({ taskId: taskLabelTable.taskId })
          .from(taskLabelTable)
          .where(inArray(taskLabelTable.labelId, labels)),
      ),
    );
  }

  const tasksSq = ctx.db
    .select()
    .from(taskTable)
    .where(and(...andClauses))
    .orderBy(direction[dir](taskTable[order_by]))
    .limit(limit)
    .offset(offset)
    .as('tasksSq');

  const query = ctx.db
    .select({
      id: tasksSq.id,
      name: tasksSq.name,
      type: tasksSq.type,
      config: tasksSq.config,
      createdAt: tasksSq.createdAt,
      updatedAt: tasksSq.updatedAt,
      label: {
        id: labelTable.id,
        name: labelTable.name,
        type: labelTable.type,
        config: labelTable.config,
        updatedAt: labelTable.updatedAt,
        createdAt: labelTable.createdAt,
      },
      image: {
        id: imageTable.id,
        filename: imageTable.filename,
        hashsum: imageTable.hashsum,
        path: imageTable.path,
      },
    })
    .from(tasksSq)
    .leftJoin(taskLabelTable, eq(tasksSq.id, taskLabelTable.taskId))
    .leftJoin(labelTable, eq(taskLabelTable.labelId, labelTable.id))
    .leftJoin(taskImageTable, eq(tasksSq.id, taskImageTable.taskId))
    .leftJoin(imageTable, eq(taskImageTable.imageId, imageTable.id));

  const countQuery = ctx.db
    .select({ count: count(taskTable.id) })
    .from(taskTable)
    .where(and(...andClauses));

  const [items, [total]] = await Promise.all([query, countQuery]);

  const transformTask = createTransformTask(ctx);

  ctx.json({
    items: transformTask(items),
    total: total.count,
  });
}

export const method = 'get';
export const route = '/api/admin/task/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, taskListSearchParamsSchema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  taskListMiddleware,
]);
