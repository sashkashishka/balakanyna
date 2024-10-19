import * as healthcheck from './api/healthcheck.js';

/**
 * @argument {import('../core/router.js').Router<import('../core/context.js').Context>} router
 */
export function connectMiddlewares(router) {
  router.get(healthcheck.route, healthcheck.middleware);

  // ... rest middlewares will be connected here
}
