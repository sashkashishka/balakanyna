import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateSearchParamsMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { taskTable } from '../../../../../db/schema.js';
import { getTaskConfigValidator } from '../schema/index.js';

import schema from './schema.json' with { type: 'json' };

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function getTaskMiddleware(ctx) {
  const searchParams = ctx.searchParams;

  const [result] = await ctx.db
    .select()
    .from(taskTable)
    .where(eq(taskTable.id, searchParams.id));

  if (!result) {
    throw new ERR_NOT_FOUND();
  }

  const validate = getTaskConfigValidator(ctx.ajv, result.type);

  validate(result.config);

  ctx.json({
    ...result,
    errors: validate.errors,
  });
}

export const method = 'get';
export const route = '/api/admin/task/get';

export const middleware = Composer.compose([
  createValidateSearchParamsMiddleware(schema, ERR_INVALID_PAYLOAD),
  getTaskMiddleware,
]);
