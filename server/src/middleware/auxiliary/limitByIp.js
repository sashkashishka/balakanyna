import { ERR_FORBIDDEN } from '../../core/errors.js';

/**
 * @argument {import('../../core/context.js').Context} ctx
 */
export function limitByIpMiddleware(ctx, next) {
  const ip = ctx.req.socket.remoteAddress || null;

  if (ip !== ctx.config.restrictions.ip) {
    throw new ERR_FORBIDDEN();
  }

  return next();
}
