import { getDb } from '../../db/index.js';
import { createServer, getRouter } from '../../server.js';
import { Logger } from '../../utils/logger.js';
import { clearDb, getTmpDbUrl, runTestMigration } from './db.js';

/**
 * @argument {{
 *   config: import('../../core/server.js').IConfig,
 *   t: import('node:test').TestContext,
 *   connectMiddleware: (router: typeof import('../../middleware/index.js').connectMiddleware)
 * }}
 */
export async function getTestServer({
  t,
  config = testConfig,
  connectMiddleware,
}) {
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
  const db = await getDb(tmpDbUrl);

  const router = getRouter(config, { logger, db }, connectMiddleware);

  // TODO: add scenarios and seed db with predefined values

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
  };
}

/**
 * @TODO: make a configuration validator
 * @type {import('./core/server.js').IConfig}
 */
export const testConfig = {
  port: process.env.PORT,
  timeouts: {
    connection: 1000,
    request: 500,
    close: 100,
  },
};
