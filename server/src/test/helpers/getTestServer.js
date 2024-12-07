import path from 'node:path';

import { getAjv } from '../../core/ajv.js';
import { getDb } from '../../db/index.js';
import { createServer, getRouter } from '../../server.js';
import { Logger } from '../../utils/logger.js';
import { clearDb, getTmpDbUrl, setupDb } from './db.js';
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

  const loggerTransport = {
    log: t.mock.fn(),
    warn: t.mock.fn(),
    error: t.mock.fn(),
  };

  const logger = new Logger({
    prefix: '[TestServer]',
    transport: loggerTransport,
  });

  const ajv = deps.ajv || getAjv();

  /**
   * @type {import('../../db/index.js').IDb}
   */
  let db = deps.db;
  let dbDir = '';

  if (!db) {
    dbDir = await setupDb(getTmpDbUrl());
    db = await getDb(dbDir);
  }

  const router = getRouter(config, { logger, ajv, db }, connectMiddleware);

  const server = await createServer(config, {
    ajv,
    logger,
    router,
    db,
  });

  function request(endpoint, options = {}) {
    const { isJson = true } = options;

    let body = undefined;
    let headers = {};

    if (options.body) {
      body = options.body;
    }

    if (isJson) {
      body = body ? JSON.stringify(body) : body;
      headers = {
        'content-type': 'application/json',
      };
    }

    let url = `http://127.0.0.1:${config.port}${endpoint}`;

    if (endpoint instanceof URL) {
      url = endpoint;
    }

    return fetch(url, {
      ...options,
      method: options.method.toUpperCase(),
      headers: {
        ...headers,
        ...options.headers,
      },
      body,
    });
  }

  await server.init();

  await seed(db, config);

  server.listen();

  async function stop() {
    await server.destroy();

    if (dbDir) {
      await clearDb(dbDir);
    }
  }

  t.after(stop);

  return {
    db,
    server,
    request,
    loggerTransport,
    config,
    baseUrl: `http://localhost:${config.port}`,
  };
}

/**
 * @TODO: make a configuration validator
 * @type {import('../../core/server.js').IConfig}
 */
export function getTestConfig() {
  return {
    port: process.env.PORT,
    static: [
      {
        prefix: '/media',
        dir: path.resolve(import.meta.dirname, '../static'),
        notFound: 'default',
      },
    ],
    search: {
      limit: 50,
    },
    timeouts: {
      connection: 1000,
      request: 500,
      close: 100,
    },
    media: {
      prefix: 'media',
      saveDir: path.resolve(import.meta.dirname, '../static/media'),
      files: 1,
      fileSize: 1024 * 1024 * 10,
      parts: 1,
      allowedExtenstion: ['jpeg', 'jpg', 'png'],
      fieldname: 'image',
    },
    salt: {
      password: process.env.PASSWORD_SALT || '123',
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
