import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskTable } from '../../../../../db/schema.js';

import { typeToSchema } from '../schema/index.js';

import schema from './schema.json' with { type: 'json' };

const ERR_INVALID_TASK_CONFIG = createError(
  'INVALID_TASK_CONFIG',
  'Invalid task config for %s',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function verifyTaskConfigSchemaMiddleware(ctx, next) {
  const body = ctx.body;

  const validator = ctx.ajv.compile(typeToSchema[body.type]);

  if (!validator(body.config)) {
    throw new ERR_INVALID_TASK_CONFIG(body.type);
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
      config: body.config,
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
  createTaskMiddleware,
]);
