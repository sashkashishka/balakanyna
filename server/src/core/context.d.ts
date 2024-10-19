import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger } from '../utils/logger.js';
import type { IDb } from '../db/index.js';
import type { IConfig } from './server.js';

export class Context {
  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    db: IDb,
    logger: Logger,
    config: IConfig
  ): void;

  db: IDb;
  req: IncomingMessage;
  res: ServerResponse;
  logger: Logger;
  config: IConfig;

  json<T>(val: T, code: number): void;
}
