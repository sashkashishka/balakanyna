/**
 * @argument {Error} err
 * @argument {import('../core/context.js').Context} ctx
 */
export function handleError(err, ctx) {
  ctx.logger.error(err);

  ctx.json(
    {
      error: err.code || err.name,
      message: err.message,
    },
    err.statusCode || 500,
  );
}
