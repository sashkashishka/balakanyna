import { getRandomId } from '../utils/randomId.js';
import { Composer } from './composer.js';
import { Context } from './context.js';

export class Router extends Composer {
  static noop() {}

  #db = undefined;
  #ajv = undefined;
  #logger = undefined;
  #config = undefined;
  #handleError = async () => void 0;

  constructor(config, { db, logger, ajv }) {
    super();
    this.#db = db;
    this.#ajv = ajv;
    this.#logger = logger;
    this.#config = config;

    this.handle = this.handle.bind(this);
  }

  async handle(req, res) {
    const ctx = new Context(
      req,
      res,
      this.#db,
      this.#ajv,
      this.#logger.clone({ reqId: getRandomId() }),
      this.#config,
    );

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
