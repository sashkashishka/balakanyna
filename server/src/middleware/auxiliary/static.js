import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import mime from 'mime-types';

import { ERR_FILE_STREAM_ERROR, ERR_NOT_FOUND } from '../../core/errors.js';

/**
 * @argument {{ prefix: string; dir: string }} options
 * @argument {{
 *   fsStat: typeof import('node:fs/promises').stat;
 *   fsCreateReadStream: typeof import('node:fs').createReadStream;
 * }} deps
 */
export function createStaticMiddleware(options, deps = {}) {
  const { prefix, dir } = options;
  const { fsStat = stat, fsCreateReadStream = createReadStream } = deps;

  /**
   * @argument {import('../../core/context.js').Context} ctx
   */
  return async function staticMiddleware(ctx, next) {
    const file = ctx.req.url;

    if (!file.startsWith(prefix)) return next();

    try {
      const { name } = path.parse(file);

      if (name.startsWith('.')) {
        throw new ERR_NOT_FOUND();
      }

      const filePath = path.join(dir, file.replace(prefix, ''));

      await fsStat(filePath);

      const fileStream = fsCreateReadStream(filePath);

      fileStream.pipe(ctx.res);

      const contentType = mime.lookup(filePath) || 'application/octet-stream';
      ctx.res.setHeader('content-type', contentType);

      // TODO: set cache headers

      // TODO:
      // check whether I need to close stream on req timeout

      // destroy on error
      fileStream.once('error', () => {
        fileStream.destroy();

        // supress error handlers
        fileStream.removeAllListeners('error');
        fileStream.on('error', () => void 0);

        ctx.throw(new ERR_FILE_STREAM_ERROR());
      });
    } catch (e) {
      ctx.logger.error(e);
      throw new ERR_NOT_FOUND();
    }
  };
}
