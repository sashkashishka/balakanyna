import * as healthcheck from './api/healthcheck.js';
import { createStaticMiddleware } from './auxiliary/static.js';

/**
 * @argument {import('../core/router.js').Router<import('../core/context.js').Context>} router
 * @argument {import('../core/server.js').IConfig} config
 */
export function connectMiddlewares(router, config) {
  router.get(healthcheck.route, healthcheck.middleware);

  if (Array.isArray(config.static)) {
    config.static.forEach((options) => {
      router.use(createStaticMiddleware(options));
    });
  }

  // ... rest middlewares will be connected here
}
