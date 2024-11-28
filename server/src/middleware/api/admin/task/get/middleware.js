import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  labelTable,
  taskLabelTable,
  taskTable,
} from '../../../../../db/schema.js';
import { getTaskConfigValidator } from '../schema/index.js';

import schema from './schema.json' with { type: 'json' };
import { addImagePrefixInTaskConfig } from '../schema/utils.js';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getTaskMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const result = await ctx.db
    .select({
      id: taskTable.id,
      name: taskTable.name,
      type: taskTable.type,
      config: taskTable.config,
      createdAt: taskTable.createdAt,
      updatedAt: taskTable.updatedAt,
      label: {
        id: labelTable.id,
        name: labelTable.name,
        type: labelTable.type,
        config: labelTable.config,
        updatedAt: labelTable.updatedAt,
        createdAt: labelTable.createdAt,
      },
    })
    .from(taskTable)
    .where(eq(taskTable.id, searchParams.id))
    .leftJoin(taskLabelTable, eq(taskTable.id, taskLabelTable.taskId))
    .leftJoin(labelTable, eq(taskLabelTable.labelId, labelTable.id));

  if (!result?.length) {
    throw new ERR_NOT_FOUND();
  }

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    label,
    ...task
  } = result[0];
  const labels = result.map(({ label }) => label).filter(Boolean);

  const validate = getTaskConfigValidator(ctx.ajv, task.type);

  validate(task.config);

  ctx.json({
    ...task,
    config: addImagePrefixInTaskConfig(
      task.type,
      task.config,
      ctx.config.media.prefix,
    ),
    labels,
    errors: validate.errors,
  });
}

export const method = 'get';
export const route = '/api/admin/task/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getTaskMiddleware,
]);
