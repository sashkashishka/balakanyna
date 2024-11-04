import cookie from 'cookie';

import { ERR_FAILED_SERIALIZATION } from './errors.js';
import { createError } from '../utils/createError.js';

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
  }

  get cookie() {
    return cookie.parse(this.req.headers.cookie || '');
  }

  setCookie(name, value, options) {
    let cookies = [];

    const resCookies = this.res.getHeader('set-cookies');

    if (resCookies === undefined) {
      cookies = [];
    } else if (typeof resCookies === 'string') {
      cookies = [resCookies];
    } else {
      cookies = resCookies;
    }

    cookies.push(cookie.serialize(name, value, options));

    console.log(cookies)

    this.res.removeHeader('set-cookies');
    this.res.setHeader('set-cookies', cookies);
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
    this.json(createError(err), err?.statusCode || 500)
  }
}
