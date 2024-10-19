import { ERR_FAILED_SERIALIZATION } from './errors.js';

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
}
