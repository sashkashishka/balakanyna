import * as healthcheck from './api/healthcheck.js';
import * as registration from './api/admin/registration.js';
import * as login from './api/admin/login.js';
import * as logout from './api/admin/logout.js';
import * as uploadImage from './api/admin/upload/image.js';
import * as userCreate from './api/admin/user/create.js';

import { receiveJsonBodyMiddleware } from './auxiliary/receiveJsonBody.js';
import { createStaticMiddleware } from './auxiliary/static.js';
import { limitByIpMiddleware } from './auxiliary/limitByIp.js';
import { verifyTokenMiddleware } from './auxiliary/jwt.js';

/**
 * @argument {import('../core/router.js').Router<import('../core/context.js').Context>} router
 * @argument {import('../core/server.js').IConfig} config
 */
export function connectMiddlewares(router, config) {
  router.use(receiveJsonBodyMiddleware);
  router[healthcheck.method](healthcheck.route, healthcheck.middleware);

  // admin
  router[registration.method](
    registration.route,
    limitByIpMiddleware,
    registration.middleware,
  );
  router[login.method](login.route, login.middleware);
  router[logout.method](logout.route, logout.middleware);

  // image upload
  router[uploadImage.method](
    uploadImage.route,
    verifyTokenMiddleware,
    uploadImage.middelware,
  );

  // user
  router[userCreate.method](
    userCreate.route,
    verifyTokenMiddleware,
    userCreate.middleware,
  );

  if (Array.isArray(config.static)) {
    config.static.forEach((options) => {
      router.use(createStaticMiddleware(options));
    });
  }
}
