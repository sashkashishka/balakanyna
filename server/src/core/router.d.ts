import { IncomingMessage, ServerResponse } from 'node:http';
import type { Ajv } from 'ajv';

import type { Composer } from './composer.js';
import type { IConfig } from '../server.js';

export interface IDependencies {
  db: IDb;
  ajv: Ajv;
  logger: Logger;
}

export interface IErrorHandler<TCtx> {
  (error: Error, ctx: TCtx): Promise<void>;
}

export class Router<TCtx> extends Composer<TCtx> {
  constructor(config: IConfig, deps: IDependencies): void;

  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;

  handleError(handler: IErrorHandler<TCtx>): void;
}
