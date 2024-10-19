export class Composer {
  #handler = Composer.passThrough();

  get middleware() {
    return this.#handler;
  }

  use(...fns) {
    this.#handler = Composer.compose([this.#handler, ...fns]);
    return this;
  }

  get(route, ...fns) {
    return this.use(
      Composer.matchMethod(
        'get',
        Composer.matchRoute(route, Composer.compose(fns)),
      ),
    );
  }

  post(route, ...fns) {
    return this.use(
      Composer.matchMethod(
        'post',
        Composer.matchRoute(route, Composer.compose(fns)),
      ),
    );
  }

  put(route, ...fns) {
    return this.use(
      Composer.matchMethod(
        'put',
        Composer.matchRoute(route, Composer.compose(fns)),
      ),
    );
  }

  patch(route, ...fns) {
    return this.use(
      Composer.matchMethod(
        'patch',
        Composer.matchRoute(route, Composer.compose(fns)),
      ),
    );
  }

  delete(route, ...fns) {
    return this.use(
      Composer.matchMethod(
        'delete',
        Composer.matchRoute(route, Composer.compose(fns)),
      ),
    );
  }

  static matchMethod(method, middleware) {
    function filter(ctx) {
      const { req } = ctx;

      return req.method.toLowerCase() === method;
    }

    return Composer.optional(filter, middleware);
  }

  static matchRoute(route, middleware) {
    /**
     * @argument {import('./context.js').Context} ctx
     */
    function filter(ctx) {
      const { req } = ctx;

      return route === req.url;
    }

    return Composer.optional(filter, middleware);
  }

  static optional(filter, middleware) {
    return async (ctx, next) => {
      const result = await filter(ctx);

      const handler = result
        ? Composer.unwrap(middleware)
        : Composer.passThrough();

      return handler(ctx, next);
    };
  }

  static passThrough() {
    return function passThrough(ctx, next) {
      return next();
    };
  }

  static unwrap(middleware) {
    return 'middleware' in middleware ? middleware.middleware : middleware;
  }

  static compose(middlewares) {
    if (!Array.isArray(middlewares)) {
      throw new Error('Middlewares should be as array');
    }

    if (middlewares.length === 0) {
      return Composer.passThrough();
    }

    if (middlewares.length === 1) {
      return Composer.unwrap(middlewares[0]);
    }

    return function composedMiddleware(ctx, next) {
      let index = -1;

      async function execute(i, context) {
        if (i <= index) {
          throw new Error('next() called twice');
        }

        const handler = Composer.unwrap(middlewares[i] ?? next);

        index = i;

        await handler(ctx, async function composedNext(ctx = context) {
          await execute(i + 1, ctx);
        });
      }

      return execute(0, ctx);
    };
  }
}
