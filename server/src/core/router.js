import { Composer } from './composer.js';
import { Context } from './context.js';

export class Router extends Composer {
  static noop() {}

  #db = undefined;
  #logger = undefined;
  #config = undefined;
  #handleError = async () => void 0;

  constructor(config, { db, logger }) {
    super();
    this.#db = db;
    this.#logger = logger;
    this.#config = config;

    this.handle = this.handle.bind(this);
  }

  async handle(req, res) {
    const ctx = new Context(req, res, this.#db, this.#logger, this.#config);

    try {
      await this.#handleRequest(ctx);
    } catch (error) {
      await this.#handleError(error, ctx);
    }
  }

  handleError(handler) {
    this.#handleError = handler;
  }

  /**
   * @argument {import('./context.js').Context} ctx
   */
  #handleRequest(ctx) {
    return this.middleware(ctx, Router.noop);
  }
}
