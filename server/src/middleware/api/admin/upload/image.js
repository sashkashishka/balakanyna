import path from 'node:path';
import fs from 'node:fs';
import { Busboy } from '@fastify/busboy';
import { eq } from 'drizzle-orm';
import * as mimeTypes from 'mime-types';

import { Composer } from '../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_UNSUPPORTED_MEDIA_TYPE,
} from '../../../../core/errors.js';
import { imageTable } from '../../../../db/schema.js';

// TODO:
// [x] check if x-checksum header present. if not - throw error - invalid request or similar
// [x] check if x-checksum header value is present in image table.
// if yes - throw error - duplicate image and return the image's data from db
// [x] check if multipart formdata not url encoded
// [ ] check file size (to be no more than 10mb)
// [ ] check for other fields (non file fields should be abcent )
// [ ] number of files to upload - 1
// [ ] field should be named as file
// [ ] accept only specific files - jpeg, jpg or png

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

const ERR_FILE_QTY_LIMIT = createError(
  'FILE_QTY_LIMIT',
  'File quantity limit',
  422,
);

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
function verifyIsMultipartFormDataContentTypeMiddleware(ctx, next) {
  const contentType = ctx.req.headers['content-type'];

  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    throw new ERR_UNSUPPORTED_MEDIA_TYPE();
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
function checkIfHaveHashsumMiddleware(ctx, next) {
  const hashsum = ctx.req.headers['x-image-hashsum'];

  if (typeof hashsum !== 'string' || hashsum?.length === 0) {
    throw new ERR_MISSING_IMAGE_HASHSUM();
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateMiddleware(ctx, next) {
  const hashsum = ctx.req.headers['x-image-hashsum'];

  const [record] = await ctx.db
    .select()
    .from(imageTable)
    .where(eq(imageTable.hashsum, hashsum));

  if (record) {
    ctx.json({
      id: record.id,
      filename: record.filename,
      hashsum: record.hashsum,
      path: record.path,
    });

    return;
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
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

  // send 400 errors if there
  // busboy.on('field')

  busboy.on(
    'file',
    function onFile(fieldname, file, filename, encoding, mimetype) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@');
      console.log({ fieldname, filename, encoding, mimetype });
      console.log('@@@@@@@@@@@@@@@@@@@@@@@');
      if (fieldname !== ctx.config.media.fieldname) {
        return reject(
          new ERR_WRONG_FILE_FIELD(fieldname, ctx.config.media.fieldname),
        );
      }

      const extension = mimeTypes.extension(mimetype);

      if (!ctx.config.media.allowedExtenstion.includes(extension)) {
        return reject(new ERR_UNSUPPORTED_IMAGE_TYPE(extension));
      }

      var saveTo = path.join(
        ctx.config.media.saveDir,
        path.basename(fieldname),
      );

      file.pipe(fs.createWriteStream(saveTo, { encoding, mimetype }));

      file.once('error', function onFileError(err) {
        ctx.logger.error(err);
        reject(err);
      });

      file.once('end', function onFileEnd() {
        ctx.logger.log('File writing finished');
      });
    },
  );

  busboy.on('field', function onField(...args) {
    console.log('@@@@@@@@@@@@@@@@@@@');
    console.log('field', args);
    console.log('@@@@@@@@@@@@@@@@@@@');
    // TODO: refactor
    reject(new Error('should not be any field'));
  });

  busboy.on('error', function onError(err) {
    console.log('@@@@@@@@@@@@@@@@@@@');
    console.log(err);
    console.log('@@@@@@@@@@@@@@@@@@@');
    reject(err);
  });

  busboy.once('filesLimit', function onFilesLimit() {
    console.log('@@@@@@@@@@@@@@@@@@@');
    console.log('filesLimit');
    console.log('@@@@@@@@@@@@@@@@@@@');
    // TODO: make it processable within promise
    reject(new ERR_INVALID_PAYLOAD('files limit'));
  });

  busboy.once('partsLimit', function onPartsLimit() {
    console.log('@@@@@@@@@@@@@@@@@@@');
    console.log('partsLimit');
    console.log('@@@@@@@@@@@@@@@@@@@');
    // reject(new ERR_INVALID_PAYLOAD('parts limit'));
  });

  busboy.once('finish', function onFinish() {
    console.log('@@@@@@@@@@@@@@@@@@@');
    console.log('finish');
    console.log('@@@@@@@@@@@@@@@@@@@');
    resolve();

    if (!ctx.res.closed) {
      ctx.json({ finish: 1 });
    }
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
