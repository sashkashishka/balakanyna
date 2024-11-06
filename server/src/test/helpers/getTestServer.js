import path from 'node:path';

import { getDb } from '../../db/index.js';
import { createServer, getRouter } from '../../server.js';
import { Logger } from '../../utils/logger.js';
import { clearDb, getTmpDbUrl, runTestMigration } from './db.js';
import { mergeDeep } from '../../utils/merge.js';

/**
 * @argument {{
 *   config: import('../../core/server.js').IConfig,
 *   t: import('node:test').TestContext,
 *   connectMiddleware: (router: typeof import('../../middleware/index.js').connectMiddleware),
 *   seed: (db: import('../../db/index.js').IDb, config: import('../../core/server.js').IConfig): Promise<void>,
 *   deps?: { db: import('../../db/index.js').IDb }
 * }}
 */
export async function getTestServer({
  t,
  config: externalConfig = {},
  connectMiddleware,
  seed = () => void 0,
  deps = {},
}) {
  const config = mergeDeep(getTestConfig(), externalConfig);
  const tmpDbUrl = getTmpDbUrl();

  await runTestMigration(tmpDbUrl);

  const loggerTransport = {
    log: t.mock.fn(),
    warn: t.mock.fn(),
    error: t.mock.fn(),
  };

  const logger = new Logger({
    prefix: '[TestServer]',
    transport: loggerTransport,
  });
  const db = deps.db || (await getDb(tmpDbUrl));

  const router = getRouter(config, { logger, db }, connectMiddleware);

  const server = await createServer(config, {
    logger,
    router,
    db,
  });

  function request(endpoint, options = {}) {
    const { headers, body, cookie } = options;

    return fetch(`http://127.0.0.1:${config.port}${endpoint}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        cookie: cookie ? cookie : '',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  await server.init();

  await seed(db, config);

  server.listen();

  async function stop() {
    await server.destroy();
    await clearDb(tmpDbUrl);
  }

  t.after(stop);

  return {
    server,
    request,
    loggerTransport,
    config,
  };
}

/**
 * @TODO: make a configuration validator
 * @type {import('./core/server.js').IConfig}
 */
export function getTestConfig() {
  return {
    port: process.env.PORT,
    static: [
      {
        prefix: '/media',
        dir: path.resolve(import.meta.dirname, '../static'),
      },
    ],
    timeouts: {
      connection: 1000,
      request: 500,
      close: 100,
    },
    salt: {
      password: process.env.PASSWORD_SALT,
    },
    jwt: {
      cookie: 'token',
      key: process.env.JWT_KEY,
      expirationTime: process.env.JWT_EXPIRATION_TIME,
    },
    restrictions: {
      ip: process.env.ALLOWED_IP,
    },
  };
}
