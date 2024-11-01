import type { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import type { Logger } from '../utils/logger.js';
import type { IDb } from '../db/index.js';
import type { IConfig } from './server.js';

export class Context {
  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    db: IDb,
    logger: Logger,
    config: IConfig,
  ): void;

  db: IDb;
  req: IncomingMessage;
  res: ServerResponse;
  logger: Logger;
  config: IConfig;

  get cookie(): ReturnType<typeof cookie.parse>;
  setCookie(
    name: string,
    value: string,
    options: cookie.SerializeOptions,
  ): void;

  json<T>(val: T, code: number): void;
}
