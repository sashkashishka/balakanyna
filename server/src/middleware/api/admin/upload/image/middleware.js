import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { Busboy } from '@fastify/busboy';
import { eq } from 'drizzle-orm';
import * as mimeTypes from 'mime-types';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_UNSUPPORTED_MEDIA_TYPE,
} from '../../../../../core/errors.js';
import { imageTable } from '../../../../../db/schema.js';

const ERR_MISSING_IMAGE_HASHSUM = createError(
  'MISSING_IMAGE_HASHSUM',
  'Missing image hashum',
  422,
);

const ERR_UNSUPPORTED_IMAGE_TYPE = createError(
  'UNSUPPORTED_IMAGE_TYPE',
  'Image type %s is not supported',
  422,
);

const ERR_WRONG_FILE_FIELD = createError(
  'WRONG_FILE_FIELD',
  'Wrong file field %s. Should be %s',
  422,
);

const ERR_HIT_FILE_SIZE_LIMIT = createError(
  'HIT_FILE_SIZE_LIMIT',
  'Hit file size limit %s',
  422,
);

export const HASHSUM_HEADER = 'x-image-hashsum';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function verifyIsMultipartFormDataContentTypeMiddleware(ctx, next) {
  const contentType = ctx.req.headers['content-type'];

  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    throw new ERR_UNSUPPORTED_MEDIA_TYPE();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function checkIfHaveHashsumMiddleware(ctx, next) {
  const hashsum = ctx.req.headers[HASHSUM_HEADER];

  if (typeof hashsum !== 'string' || hashsum?.length === 0) {
    throw new ERR_MISSING_IMAGE_HASHSUM();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateMiddleware(ctx, next) {
  const hashsum = ctx.req.headers[HASHSUM_HEADER];

  const [record] = await ctx.db
    .select()
    .from(imageTable)
    .where(eq(imageTable.hashsum, hashsum));

  if (record) {
    ctx.json([
      {
        id: record.id,
        filename: record.filename,
        hashsum: record.hashsum,
        path: record.path,
      },
    ]);

    return;
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function uploadImageMiddelware(ctx) {
  const { resolve, reject, promise } = Promise.withResolvers();

  const busboy = new Busboy({
    headers: ctx.req.headers,
    limits: {
      files: ctx.config.media.files,
      fileSize: ctx.config.media.fileSize,
      parts: ctx.config.media.parts,
    },
  });

  /**
   * @type {import('node:fs').WriteStream}
   */
  let fileWriteStream = undefined;
  /**
   * imageDb resut
   */
  let result = [];

  function destroyFileWriteStream() {
    fileWriteStream?.removeAllListeners?.();

    if (!fileWriteStream?.closed) {
      fileWriteStream?.destroy?.();
    }
  }

  busboy.on(
    'file',
    function onFile(fieldname, file, filename, encoding, mimetype) {
      if (fieldname !== ctx.config.media.fieldname) {
        return reject(
          new ERR_WRONG_FILE_FIELD(fieldname, ctx.config.media.fieldname),
        );
      }

      const extension = mimeTypes.extension(mimetype);

      if (!ctx.config.media.allowedExtenstion.includes(extension)) {
        return reject(new ERR_UNSUPPORTED_IMAGE_TYPE(extension));
      }

      filename = path.basename(filename);
      var saveTo = path.join(ctx.config.media.saveDir, filename);

      fileWriteStream = fs.createWriteStream(saveTo, {
        mimetype,
      });

      // TODO check for memory leak
      file.pipe(fileWriteStream);

      fileWriteStream.once('close', async function writeToDb() {
        result = await ctx.db
          .insert(imageTable)
          .values({
            filename,
            hashsum: ctx.req.headers[HASHSUM_HEADER],
            path: filename,
          })
          .returning();

        if (!ctx.res.closed) {
          ctx.json(result);
        }

        resolve();
      });

      file.on('limit', function onFileSizeLimit() {
        file.destroy();

        fsp
          .rm(saveTo)
          .catch((err) => {
            ctx.logger.error('[remove limit file]', err);
          })
          .then(() => {
            reject(new ERR_HIT_FILE_SIZE_LIMIT(ctx.config.media.fileSize));
          });
      });

      file.once('error', function onFileError(err) {
        destroyFileWriteStream();
        ctx.logger.error(err);
        reject(err);
      });
    },
  );

  busboy.on('error', function onError(err) {
    destroyFileWriteStream();
    reject(err);
  });

  busboy.once('finish', function onFinish() {
    if (fileWriteStream) return;

    destroyFileWriteStream();

    if (!ctx.res.closed) {
      ctx.json(result);
    }

    resolve();
  });

  ctx.req.pipe(busboy);

  return promise;
}

export const method = 'post';
export const route = '/api/admin/upload/image';

export const middelware = Composer.compose([
  verifyIsMultipartFormDataContentTypeMiddleware,
  checkIfHaveHashsumMiddleware,
  checkIfDuplicateMiddleware,
  uploadImageMiddelware,
]);
