import path from 'node:path';
import process from 'node:process';
import { createServer } from './server.js';

process.title = 'balakanyna-server';

/**
 * @TODO: make a configuration validator
 * @type {import('./core/server.js').IConfig}
 */
const config = {
  db: {
    url: path.join(import.meta.dirname, process.env.DB_FILE),
  },
  logger: {
    enabled: process.env.ENABLE_LOGGER === '1',
    transport: process.env.LOGGER_TRANSPORT,
    destinations: [
      {
        level: 'all',
        file: path.join(import.meta.dirname, process.env.LOG_FILE),
      },
    ],
  },
  port: process.env.PORT,
  static: [
    {
      prefix: process.env.IMAGES_PREFIX,
      dir: path.join(import.meta.dirname, process.env.IMAGES_DIR),
      notFound: 'default',
    },
    {
      prefix: process.env.ADMIN_PREFIX,
      dir: path.join(import.meta.dirname, process.env.ADMIN_DIR),
      notFound: 'index',
    },
    {
      prefix: process.env.CLIENT_PREFIX,
      dir: path.join(import.meta.dirname, process.env.CLIENT_DIR),
      notFound: 'index',
    },
  ],
  timeouts: {
    connection: 10000,
    request: 5000,
    close: 3000,
    worker: 3000,
  },
  search: {
    limit: 50,
  },
  media: {
    prefix: process.env.IMAGES_PREFIX,
    saveDir: path.join(import.meta.dirname, process.env.IMAGES_DIR),
    files: 1,
    fileSize: 1024 * 1024 * 10,
    parts: 1,
    allowedExtenstion: ['jpeg', 'jpg', 'png'],
    fieldname: 'image',
  },
  salt: {
    password: process.env.PASSWORD_SALT,
  },
  jwt: {
    cookie: process.env.COOKIE_NAME,
    key: process.env.JWT_KEY,
    expirationTime: process.env.JWT_EXPIRATION_TIME,
  },
  restrictions: {
    ip: process.env.ALLOWED_IP,
  },
};

const balakanynaServer = await createServer(config);

await balakanynaServer.init();

balakanynaServer.listen();
