import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Ajv } from 'ajv';
import * as cookie from 'cookie';

import type { Logger } from '../utils/logger/logger.js';
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

  sign<TPayload>(payload: TPayload): Promise<string>;
  verify<TPayload>(token: string): Promise<false | TPayload>;
}

export class Context {
  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    db: IDb,
    ajv: Ajv,
    logger: Logger,
    config: IConfig,
  ): void;

  db: IDb;
  ajv: Ajv;
  req: IncomingMessage;
  res: ServerResponse;
  logger: Logger;
  config: IConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  url: URL;
  searchParams: Record<string, unknown>;

  cookie: Cookie;
  jwt: Jwt;

  json<T>(val: T, code: number): void;
  throw(err: Error): void;
}
