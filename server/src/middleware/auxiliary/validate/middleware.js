/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
export function bodyGetter(ctx) {
  return ctx.body;
}

/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
export function searchParamsGetter(ctx) {
  return ctx.searchParams;
}

export function createValidateBodyMiddleware(schema, error) {
  return createValidateReqMiddleware(bodyGetter, schema, error);
}

export function createValidateSearchParamsMiddleware(schema, error) {
  return createValidateReqMiddleware(searchParamsGetter, schema, error);
}

export function createValidateReqMiddleware(getter, schema, error) {
  /**
   * @argument {import('../../../core/context.js').Context} ctx
   */
  return async function validateReqMiddleware(ctx, next) {
    const data = await getter(ctx);

    const validate = ctx.ajv.compile(schema);

    if (!validate(data)) {
      throw new error();
    }

    return next();
  };
}
