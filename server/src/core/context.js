import cookie from 'cookie';
import { SignJWT, jwtVerify, importJWK } from 'jose';

import { ERR_FAILED_SERIALIZATION } from './errors.js';
import { createErrorResponse } from '../utils/createErrorResponse.js';
import { getUrl } from '../utils/network.js';

export class Cookie {
  /**
   * @type {import('node:http').IncomingMessage}
   */
  #req = undefined;
  /**
   * @type {import('node:http').ServerResponse}
   */
  #res = undefined;

  constructor(req, res) {
    this.#req = req;
    this.#res = res;
  }

  getCookies() {
    return cookie.parse(this.#req.headers.cookie || '');
  }

  getCookie(name) {
    return this.getCookies()[name];
  }

  setCookie(name, value, options) {
    let cookies = [];

    const resCookies = this.#res.getHeader('set-cookies');

    if (resCookies === undefined) {
      cookies = [];
    } else if (typeof resCookies === 'string') {
      cookies = [resCookies];
    } else {
      cookies = resCookies;
    }

    cookies.push(cookie.serialize(name, value, options));

    this.#res.removeHeader('set-cookies');
    this.#res.setHeader('set-cookies', cookies);
  }
}

export class Jwt {
  /**
   * @type {{ key: string; expirationTime: string; }}
   */
  #options = {};

  constructor(options) {
    this.#options = options;
  }

  async #getKey() {
    return importJWK({
      alg: 'HS256',
      kty: 'oct',
      k: this.#options.key,
    });
  }

  async sign(payload) {
    const key = await this.#getKey();

    const signer = new SignJWT(payload);

    return signer
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.#options.expirationTime)
      .sign(key);
  }

  async verify(token) {
    try {
      const key = await this.#getKey();

      const result = await jwtVerify(token, key);

      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  }
}

export class Context {
  constructor(req, res, db, logger, config) {
    /**
     * @type {import('node:http').IncomingMessage}
     */
    this.req = req;
    /**
     * @type {import('node:http').ServerResponse}
     */
    this.res = res;
    /**
     * @type {import('../db/index.js').IDb}
     */
    this.db = db;
    /**
     * @type {import('../utils/logger.js').Logger}
     */
    this.logger = logger;
    /**
     * @type {import('./server.js').IConfig}
     */
    this.config = config;
    /**
     * @type {Cookie}
     */
    this.cookie = new Cookie(req, res);
    /**
     * @type {Jwt}
     */
    this.jwt = new Jwt({
      key: config.jwt.key,
      expirationTime: config.jwt.expirationTime,
    });

    this.body = undefined;

    this.url = getUrl(req.url)
  }

  json(val, code = 200) {
    try {
      const str = JSON.stringify(val);

      this.res
        .writeHead(code, {
          'content-type': 'application/json',
        })
        .end(str);
    } catch (e) {
      throw new ERR_FAILED_SERIALIZATION(e);
    }
  }

  throw(err) {
    this.json(createErrorResponse(err), err?.statusCode || 500);
  }
}
