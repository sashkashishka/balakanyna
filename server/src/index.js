import path from 'node:path';
import process from 'node:process';
import { createServer } from './server.js';

process.title = 'balakanyna-server';

/**
 * @TODO: make a configuration validator
 * @type {import('./core/server.js').IConfig}
 */
const config = {
  logger: {
    enabled: process.env.ENABLE_LOGGER === '1',
    transport: process.env.LOGGER_TRANSPORT,
    destinations: [
      {
        level: 'all',
        file: path.resolve(import.meta.dirname, './balakanyna.log'),
      },
    ],
  },
  port: process.env.PORT,
  static: [
    {
      prefix: '/media',
      dir: path.resolve(import.meta.dirname, '../static/media'),
      notFound: 'default',
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
    prefix: 'media',
    saveDir: path.resolve(import.meta.dirname, '../static/media'),
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
    cookie: 'token',
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
