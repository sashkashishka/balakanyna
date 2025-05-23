import { createServer } from 'node:http';
import process from 'node:process';
import timers from 'node:timers';

export class Server {
  /**
   * @type {import('./server.js').IConfig}
   */
  #config = undefined;
  /**
   * @type {import('../utils/logger/logger.js').Logger}
   */
  #logger = undefined;
  /**
   * @type {Router<import('./context.js').IContext>}
   */
  #router = undefined;
  /**
   * @type {import('ajv').Ajv}
   */
  #ajv = undefined;
  /**
   * @type {import('node:http').Server}
   */
  #server = undefined;
  /**
   * @type {import('../db/index.js').IDb}
   */
  #db = undefined;

  constructor(config, deps) {
    this.#config = config;

    this.#db = deps.db;
    this.#router = deps.router;
    this.#logger = deps.logger;
    this.#ajv = deps.ajv;
  }

  get db() {
    return this.#db;
  }

  get server() {
    return this.#server;
  }

  get router() {
    return this.#router;
  }

  get ajv() {
    return this.#ajv;
  }

  async init() {
    this.#initServer();
  }

  listen() {
    this.#server.listen({ port: this.#config.port, host: '0.0.0.0' }, () =>
      this.#logger.log({
        message: 'Server started',
      }),
    );
  }

  /**
   * @argument {NodeJS.Signals} signal
   */
  async destroy(signal) {
    if (signal) {
      this.#logger.log({
        message: 'Destroy',
        signal,
      });
    }

    await this.#closeServer();
    this.#db.$client.close();
    await this.#logger.stop();

    process.removeAllListeners();
  }

  #initServer() {
    this.#server = createServer(this.#router.handle);

    const destroy = this.destroy.bind(this);

    this.#server.requestTimeout = this.#config.timeouts.request;
    // this.#server.keepAliveTimeout = this.#config.keepAliveTimeout;

    // timeout for connection in general
    this.#server.setTimeout(this.#config.timeouts.connection);

    process.once('SIGINT', destroy);
    process.once('SIGTERM', destroy);
    process.once('TERMINATE', destroy);
  }

  #closeServer() {
    return new Promise((resolve, reject) => {
      const timer = timers.setTimeout(() => {
        this.#server.closeAllConnections();
      }, this.#config.timeouts.close);

      this.#server.close((err) => {
        timers.clearTimeout(timer);

        if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') {
          this.#logger.error({ err });

          return reject(err);
        }

        resolve();
      });
    });
  }
}
