import { getAjv } from './core/ajv.js';
import { Server } from './core/server.js';
import { Router } from './core/router.js';
import { Logger } from './utils/logger/logger.js';

import { getDb } from './db/index.js';
import { connectMiddlewares } from './middleware/index.js';
import { handleErrorMiddleware } from './middleware/auxiliary/handleError/middleware.js';
import { notFoundMiddleware } from './middleware/auxiliary/notFound/middleware.js';

export function getRouter(config, deps, connect = connectMiddlewares) {
  const router = new Router(config, deps);

  router.handleError(handleErrorMiddleware);

  connect(router, config);

  router.use(notFoundMiddleware);

  return router;
}

/**
 * @argument {import('./core/server.js').IConfig} config
 */
export async function createServer(config, deps = {}) {
  const ajv = deps.ajv || getAjv();
  const logger =
    deps.logger ||
    new Logger({
      enabled: config.logger.enabled,
      prefix: '[BalakanynaServer]',
      transport: Logger.getTransport(config),
    });
  const db = deps.database || (await getDb(config.db.url));
  const router = deps.router || getRouter(config, { logger, ajv, db });

  return new Server(config, {
    db,
    ajv,
    router,
    logger,
  });
}
