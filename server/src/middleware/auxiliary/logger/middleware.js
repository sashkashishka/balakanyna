/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
export function loggerMiddleware(ctx, next) {
  ctx.logger.log({
    req: {
      method: ctx.req.method,
      url: ctx.req.url,
      msg: 'incoming request',
    },
  });

  return next();
}
