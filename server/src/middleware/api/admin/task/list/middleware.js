import { and, asc, desc, gte, count, inArray, like, lte } from 'drizzle-orm';
import { Composer } from '../../../../../core/composer.js';

import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import {
  taskTable,
  taskLabelTable,
  programTaskTable,
  programTable,
} from '../../../../../db/schema.js';
import { getTaskConfigValidator } from '../schema/index.js';

import paginationSchema from '../../../../../schema/pagination.json' with { type: 'json' };
import schema from './schema.json' with { type: 'json' };

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
    andClauses.push(like(taskTable.name, `%${name}%`));
  }

  if (types) {
    andClauses.push(inArray(taskTable.type, types));
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

  let query = ctx.db
    .select()
    .from(taskTable)
    .orderBy(direction[dir](taskTable[order_by]));

  if (andClauses.length) {
    query = query.where(and(...andClauses));
  }

  const [items, [total]] = await Promise.all([
    query.limit(limit).offset(offset),
    ctx.db.select({ count: count(taskTable.id) }).from(taskTable),
  ]);

  ctx.json({
    items: items.map((task) => {
      const validate = getTaskConfigValidator(ctx.ajv, task.type);
      validate(task.config);
      return { ...task, errors: validate.errors };
    }),
    total: total.count,
  });
}

export const method = 'get';
export const route = '/api/admin/task/list';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    {
      allOf: [paginationSchema, schema],
    },
    ERR_INVALID_PAYLOAD,
  ),
  taskListMiddleware,
]);
