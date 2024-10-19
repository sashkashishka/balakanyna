import { IncomingMessage, ServerResponse } from 'node:http';
import type { Composer } from './composer.js';
import type { IConfig } from '../server.js';

export interface IDependencies {
  db: IDb;
  logger: Logger;
}

export interface IErrorHandler<Ctx> {
  (error: Error, ctx: Ctx): Promise<void>;
}

export class Router<Ctx> extends Composer<Ctx> {
  constructor(config: IConfig, deps: IDependencies): void;

  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;

  handleError(handler: IErrorHandler<Ctx>): void;
}
