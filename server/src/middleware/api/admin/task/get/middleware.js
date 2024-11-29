import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import {
  imageTable,
  labelTable,
  taskImageTable,
  taskLabelTable,
  taskTable,
} from '../../../../../db/schema.js';
import { createTransformTask } from '../pipes/task.js';

import { taskGetSearchParamsSchema } from './schema.js';

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
      image: {
        id: imageTable.id,
        filename: imageTable.filename,
        hashsum: imageTable.hashsum,
        path: imageTable.path,
      },
    })
    .from(taskTable)
    .where(eq(taskTable.id, searchParams.id))
    .leftJoin(taskLabelTable, eq(taskTable.id, taskLabelTable.taskId))
    .leftJoin(labelTable, eq(taskLabelTable.labelId, labelTable.id))
    .leftJoin(taskImageTable, eq(taskTable.id, taskImageTable.taskId))
    .leftJoin(imageTable, eq(taskImageTable.imageId, imageTable.id));

  if (!result?.length) {
    throw new ERR_NOT_FOUND();
  }

  const transformTask = createTransformTask(ctx);

  const [task] = transformTask(result);

  ctx.json({
    id: task.id,
    name: task.name,
    type: task.type,
    config: task.config,
    labels: task.labels,
    errors: task.errors,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}

export const method = 'get';
export const route = '/api/admin/task/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(
    taskGetSearchParamsSchema,
    ERR_INVALID_PAYLOAD,
  ),
  getTaskMiddleware,
]);
