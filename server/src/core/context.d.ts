import type { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import type { Logger } from '../utils/logger.js';
import type { IDb } from '../db/index.js';
import type { IConfig } from './server.js';

class Cookie {
  constructor(req: IncomingMessage, res: ServerResponse): void;

  getCookies(): ReturnType<typeof cookie.parse>;
  getCookie(name: string): string | undefined;
  setCookie(
    name: string,
    value: string,
    options: cookie.SerializeOptions,
  ): void;
}

export class Jwt {
  constructor(options: IConfig['jwt']): void;

  sign<P>(payload: P): Promise<string>;
  verify<P>(token: string): Promise<false | P>;
}

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
  body: any;

  cookie: Cookie;
  jwt: Jwt;

  json<T>(val: T, code: number): void;
  throw(err: Error): void;
}
