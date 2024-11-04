import { createError } from '../utils/createError.js';

/**
 * @argument {Error} err
 * @argument {import('../core/context.js').Context} ctx
 */
export function handleError(err, ctx) {
  ctx.logger.error(err);

  ctx.json(createError(err), err.statusCode || 500);
}
