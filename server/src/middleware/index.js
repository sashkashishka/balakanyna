import * as healthcheck from './api/healthcheck/middleware.js';

import * as registration from './api/admin/registration/middleware.js';
import * as login from './api/admin/login/middleware.js';
import * as logout from './api/admin/logout/middleware.js';

import * as uploadImage from './api/admin/upload/image/middleware.js';

import * as userCreate from './api/admin/user/create/middleware.js';
import * as userGet from './api/admin/user/get/middleware.js';
import * as userUpdate from './api/admin/user/update/middleware.js';
import * as userList from './api/admin/user/list/middleware.js';

import * as labelCreate from './api/admin/label/create/middleware.js';
import * as labelUpdate from './api/admin/label/update/middleware.js';
import * as labelList from './api/admin/label/list/middleware.js';

import * as taskCreate from './api/admin/task/create/middleware.js';
import * as taskUpdate from './api/admin/task/update/middleware.js';
import * as taskDelete from './api/admin/task/delete/middleware.js';
import * as taskGet from './api/admin/task/get/middleware.js';

import * as programCreate from './api/admin/program/create/middleware.js';
import * as programUpdate from './api/admin/program/update/middleware.js';

import { receiveJsonBodyMiddleware } from './auxiliary/receiveJsonBody/middleware.js';
import { createStaticMiddleware } from './auxiliary/static/middleware.js';
import { limitByIpMiddleware } from './auxiliary/limitByIp/middleware.js';
import { verifyTokenMiddleware } from './auxiliary/jwt/middleware.js';

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
  router[userGet.method](
    userGet.route,
    verifyTokenMiddleware,
    userGet.middleware,
  );
  router[userUpdate.method](
    userUpdate.route,
    verifyTokenMiddleware,
    userUpdate.middleware,
  );
  router[userList.method](
    userList.route,
    verifyTokenMiddleware,
    userList.middleware,
  );

  // label
  router[labelCreate.method](
    labelCreate.route,
    verifyTokenMiddleware,
    labelCreate.middleware,
  );
  router[labelUpdate.method](
    labelUpdate.route,
    verifyTokenMiddleware,
    labelUpdate.middleware,
  );
  router[labelList.method](
    labelList.route,
    verifyTokenMiddleware,
    labelList.middleware,
  );

  // task
  router[taskCreate.method](
    taskCreate.route,
    verifyTokenMiddleware,
    taskCreate.middleware,
  );
  router[taskUpdate.method](
    taskUpdate.route,
    verifyTokenMiddleware,
    taskUpdate.middleware,
  );
  router[taskDelete.method](
    taskDelete.route,
    verifyTokenMiddleware,
    taskDelete.middleware,
  );
  router[taskGet.method](
    taskGet.route,
    verifyTokenMiddleware,
    taskGet.middleware,
  );

  // program
  router[programCreate.method](
    programCreate.route,
    verifyTokenMiddleware,
    programCreate.middleware,
  );
  router[programUpdate.method](
    programUpdate.route,
    verifyTokenMiddleware,
    programUpdate.middleware,
  );

  if (Array.isArray(config.static)) {
    config.static.forEach((options) => {
      router.use(createStaticMiddleware(options));
    });
  }
}
