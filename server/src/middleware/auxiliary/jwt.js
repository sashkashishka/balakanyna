import { ERR_UNAUTHORIZED } from '../../core/errors.js';

/**
 * @argument {import('../../core/context.js').Context} ctx
 */
export async function verifyTokenMiddleware(ctx, next) {
  const token = ctx.cookie.getCookie(ctx.config.jwt.cookie);

  if (!token) {
    throw new ERR_UNAUTHORIZED();
  }

  const isValid = await ctx.jwt.verify(token);

  if (!isValid) {
    throw new ERR_UNAUTHORIZED();
  }

  return next();
}
