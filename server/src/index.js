import path from 'node:path';
import process from 'node:process';
import { createServer } from './server.js';

process.title = 'balakanyna-server';

/**
 * @TODO: make a configuration validator
 * @type {import('./core/server.js').IConfig}
 */
const config = {
  port: process.env.PORT,
  static: [
    {
      prefix: '/media',
      dir: path.resolve(import.meta.dirname, '../static'),
    },
  ],
  timeouts: {
    connection: 10000,
    request: 5000,
    close: 3000,
  },
};

const balakanynaServer = await createServer(config);

await balakanynaServer.init();

balakanynaServer.listen();
