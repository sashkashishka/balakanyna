import { ERR_NOT_FOUND } from '../../../core/errors.js';

/**
 * @argument {import('../../core/context.js').Context} ctx
 */
export function notFoundMiddleware() {
  throw new ERR_NOT_FOUND();
}
