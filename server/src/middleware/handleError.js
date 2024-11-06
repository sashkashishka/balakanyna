import { createErrorResponse } from '../utils/createErrorResponse.js';

/**
 * @argument {Error} err
 * @argument {import('../core/context.js').Context} ctx
 */
export function handleErrorMiddleware(err, ctx) {
  ctx.logger.error(err);

  ctx.json(createErrorResponse(err), err.statusCode || 500);
}
