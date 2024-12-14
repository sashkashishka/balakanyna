import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import mime from 'mime-types';

import { ERR_FILE_STREAM_ERROR, ERR_NOT_FOUND } from '../../../core/errors.js';
import { getFilePath } from './utils.js';

/**
 * @argument {{ prefix: string; dir: string; notFound: 'default' | 'index' }} options
 * @argument {{
 *   fsStat: typeof import('node:fs/promises').stat;
 *   fsCreateReadStream: typeof import('node:fs').createReadStream;
 * }} deps
 */
export function createStaticMiddleware(options, deps = {}) {
  const { prefix, dir, notFound = 'default' } = options;
  const { fsStat = stat, fsCreateReadStream = createReadStream } = deps;

  /**
   * @argument {import('../../../core/context.js').Context} ctx
   */
  return async function staticMiddleware(ctx, next) {
    const file = ctx.req.url;

    if (!file.startsWith(prefix)) return next();

    try {
      const { filePath, code } = await getFilePath({
        prefix,
        file,
        dir,
        notFound,
        fsStat,
      });

      const fileStream = fsCreateReadStream(filePath);

      ctx.res.statusCode = code;
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
    } catch (err) {
      ctx.logger.error({ err, place: '[staticMiddleware]' });
      throw err;
    }
  };
}
