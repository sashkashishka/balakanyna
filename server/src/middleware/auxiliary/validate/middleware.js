export function createValidateMiddleware(getter, schema, error) {
  /**
   * @argument {import('../../../core/context.js').Context} ctx
   */
  return async function validateMiddleware(ctx, next) {
    const data = await getter(ctx);

    const validate = ctx.ajv.compile(schema);

    if (!validate(data)) {
      throw new error();
    }

    return next();
  };
}
