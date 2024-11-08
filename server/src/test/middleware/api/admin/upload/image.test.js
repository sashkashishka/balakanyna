import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { File } from 'node:buffer';
import path from 'node:path';

import { getTestServer } from '../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../helpers/utils.js';

import * as uploadImage from '../../../../../middleware/api/admin/upload/image.js';

import { seedAdmins } from '../../../../../db/seeders.js';
import { admin } from '../fixtures/admin.js';

async function getSupportedFile() {
  const name = 'foo.jpg';
  const type = 'image/jpg';
  const filepath = path.resolve(
    import.meta.dirname,
    './fixtures/rivendell.jpg',
  );

  const file = new File(Buffer.from([await fsp.readFile(filepath)]), name, {
    type,
  });

  return {
    name,
    type,
    filepath,
    file,
  };
}

async function getUnSupportedFile() {
  const name = 'baz.gif';
  const type = 'image/gif';
  const filepath = path.resolve(
    import.meta.dirname,
    './fixtures/unsupported.gif',
  );

  const file = new File(Buffer.from([await fsp.readFile(filepath)]), name, {
    type,
  });

  return {
    name,
    type,
    filepath,
    file,
  };
}

describe('[api] upload image', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(uploadImage.route, {
      method: uploadImage.method,
      cookie: 'token=123',
      headers: {
        'x-image-hashsum': '123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 415 if try to upload not multipart form-data content type', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(uploadImage.route, {
      method: uploadImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 415);
    assert.deepEqual(body, {
      error: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Unsupported Media Type',
    });
  });

  test('should return 422 if try to upload image without custom hash header', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(uploadImage.route, {
      method: uploadImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
        'content-type': 'multipart/form-data',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 422);
    assert.deepEqual(body, {
      error: 'MISSING_IMAGE_HASHSUM',
      message: 'Missing image hashum',
    });
  });

  test('should return 400 if try to upload file with a wrong field name', async (t) => {
    const fieldname = 'file';
    const wrongFieldname = 'file1';

    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
        media: {
          fieldname,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file } = await getUnSupportedFile();

    formData.append(wrongFieldname, file);

    const resp = await request(uploadImage.route, {
      method: uploadImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
        'x-image-hashsum': '123',
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 422);
    assert.deepEqual(body, {
      error: 'WRONG_FILE_FIELD',
      message: `Wrong file field ${wrongFieldname}. Should be ${fieldname}`,
    });
  });

  // test('should return 400 if try to upload more than 1 file at once', async (t) => {
  //   const { request } = await getTestServer({
  //     t,
  //     config: {
  //       salt: { password: '123' },
  //     },
  //     async seed(db, config) {
  //       await seedAdmins(db, [admin], config.salt.password);
  //     },
  //   });

  //   const resp = await request(uploadImage.route, {
  //     method: uploadImage.method,
  //     headers: {
  //       cookie: await getAuthCookie(request, admin),
  //     },
  //   });
  //   const body = await resp.json();

  //   assert.equal(resp.status, 422);
  //   assert.deepEqual(body, {
  //     error: 'MISSING_IMAGE_HASHSUM',
  //     message: 'Missing image hashum',
  //   });
  // });

  test.todo('should return 400 if try to send file in base64 format');
  test.todo('should return 400 if unsupported file type');
  test.todo('should return 400 if file size is too big');
  test.todo('should return 400 if try to send additional fields besides file');
  test.todo('should return 200 if try to upload duplicate image');
  test.todo('should return 200 and file record from db on success upload');
});
