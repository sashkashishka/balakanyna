import type { Servers as HttpServer } from 'node:http';
import type { Router } from './core/router.js';
import type { Logger } from './utils/logger.js';
import type { IDb } from './db/index.js';
import type { Context } from './context.js';

export interface IDependencies {
  router: Router;
  db: IDb;
  logger: Logger;
}

export interface IConfig {
  port: number;
  static: Array<{ prefix: string; dir: string }>;
  timeouts: {
    connection: number;
    request: number;
    close: number;
  };
  jwt: {
    cookie: string;
    key: string;
    expirationTime: string;
  };
  restrictions: {
    /*
     * from what ip address requests will be allowed
     */
    ip: string;
  };
}

export class Server {
  constructor(config: IConfig, dependencies: IDependencies): void;

  init(): Promise<void>;

  listen(): void;

  destroy(signal?: NodeJS.Signals): Promise<void>;

  get db(): IDb;

  get server(): HttpServer;

  get router(): Router<Context>;
}
