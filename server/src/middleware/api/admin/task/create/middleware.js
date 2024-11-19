import { eq, count } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskTable } from '../../../../../db/schema.js';

import { verifyTaskConfigSchemaMiddleware } from '../schema/index.js';

import schema from './schema.json' with { type: 'json' };
import { sortJsonKeys } from '../../../../../utils/json.js';

const ERR_DUPLICATE_TASK = createError('DUPLICATE_TASK', '%s', 400);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkDuplicateConfigurationMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ id: taskTable.id })
    .from(taskTable)
    .where(eq(taskTable.config, sortJsonKeys(body.config)))
    .limit(1);

  if (result?.id) {
    throw new ERR_DUPLICATE_TASK(result.id);
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function createTaskMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .insert(taskTable)
    .values({
      name: body.name,
      type: body.type,
      config: sortJsonKeys(body.config),
    })
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

export const method = 'post';
export const route = '/api/admin/task/create';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  verifyTaskConfigSchemaMiddleware,
  checkDuplicateConfigurationMiddleware,
  createTaskMiddleware,
]);
