import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as imageUpload from '../../../../../../middleware/api/admin/image/upload/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';

async function getSupportedFile() {
  const name = 'foo.jpeg';
  const type = 'image/jpeg';
  const filepath = path.resolve(
    import.meta.dirname,
    '../fixtures/rivendell.jpg',
  );

  const file = await fs.openAsBlob(filepath, { type });

  return {
    name,
    type,
    filepath,
    file,
    extension: path.extname(name),
  };
}

async function getUnSupportedFile() {
  const name = 'baz.gif';
  const type = 'image/gif';
  const filepath = path.resolve(
    import.meta.dirname,
    '../fixtures/unsupported.gif',
  );

  const file = await fs.openAsBlob(filepath, { type });

  return {
    name,
    type,
    filepath,
    file,
  };
}

let saveDir = undefined;
const fieldname = 'file';

beforeEach(async () => {
  saveDir = await fsp.mkdtemp(path.resolve(import.meta.dirname, 'tmp', 'test'));
});

afterEach(async () => {
  await fsp.rmdir(saveDir, { recursive: true, force: true });
});

describe('[api] image upload', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: 'token=123',
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
        media: {
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
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

  test('should return 422 if try to upload file with a wrong field name', async (t) => {
    const wrongFieldname = 'file1';

    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file } = await getUnSupportedFile();

    formData.append(wrongFieldname, file);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
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

  test('should return 422 if unsupported file type', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          allowedExtenstion: ['jpeg'],
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name } = await getUnSupportedFile();

    formData.append(fieldname, file, name);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 422);
    assert.deepEqual(body, {
      error: 'UNSUPPORTED_IMAGE_TYPE',
      message: `Image type gif is not supported`,
    });
  });

  test('should return 200 with empty response if try to send file in base64 format', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          allowedExtenstion: ['jpeg'],
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { filepath } = await getSupportedFile();

    formData.append(fieldname, await fsp.readFile(filepath, 'utf8'));

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, []);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 0, 'should not save any file');
  });

  test('should return 200 with empty response if try to send text field FIRST alongside with field', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          allowedExtenstion: ['jpeg'],
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name } = await getSupportedFile();

    formData.append('test', 1);
    formData.append(fieldname, file, name);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, []);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 0, 'should not save any file');
  });

  test('should return 200 if try to send text field SECOND alongside with field', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        timeouts: {
          connection: 1000,
        },
        media: {
          fieldname,
          allowedExtenstion: ['jpeg', 'jpg'],
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name, extension } = await getSupportedFile();

    formData.append(fieldname, file, name);
    formData.append('test', 1);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);

    assert.ok(Array.isArray(body));

    const [image] = body;
    const hashedFilename = `${image.hashsum}${extension}`;

    assert.ok(image);
    assert.equal(typeof image.id, 'number');
    assert.equal(image.filename, name);
    assert.equal(typeof image.hashsum, 'string');
    assert.equal(image.path, hashedFilename);
    assert.equal(isNaN(new Date(image.createdAt)), false);
    assert.equal(isNaN(new Date(image.updatedAt)), false);
    assert.equal(Object.keys(image).length, 6);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 1, 'should save any file');
    assert.equal(files[0], hashedFilename);
  });

  test('should return 200 with first file as response if try to upload more than 1 file at once', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          parts: 1,
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name, extension } = await getSupportedFile();

    formData.append(fieldname, file, name);
    formData.append(fieldname, file, name);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);

    assert.ok(Array.isArray(body));

    const [image] = body;
    const hashedFilename = `${image.hashsum}${extension}`;

    assert.ok(image);
    assert.equal(typeof image.id, 'number');
    assert.equal(image.filename, name);
    assert.equal(typeof image.hashsum, 'string');
    assert.equal(image.path, hashedFilename);
    assert.equal(isNaN(new Date(image.createdAt)), false);
    assert.equal(isNaN(new Date(image.updatedAt)), false);
    assert.equal(Object.keys(image).length, 6);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 1, 'should save any file');
    assert.equal(files[0], hashedFilename);
  });

  test('should return 200 and empty response if there is no file has been uploaded', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          parts: 1,
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, []);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 0, 'should not save file');
  });

  test('should return 400 if file size is too big', async (t) => {
    const fileSize = 1000000;

    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          parts: 1,
          saveDir,
          fileSize,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name } = await getSupportedFile();

    formData.append(fieldname, file, name);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 422);
    assert.deepEqual(body, {
      error: 'HIT_FILE_SIZE_LIMIT',
      message: `Hit file size limit ${fileSize}`,
    });

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 0, 'should clear large files if they hit limit');
  });

  test('should return 200 if try to upload duplicate image', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date() });

    const { request } = await getTestServer({
      t,
      config: {
        media: {
          fieldname,
          parts: 1,
          saveDir,
        },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const formData = new FormData();

    const { file, name, extension } = await getSupportedFile();

    formData.append(fieldname, file, name);

    const resp = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);

    assert.ok(Array.isArray(body));

    const [image] = body;
    const hashedFilename = `${image.hashsum}${extension}`;

    assert.ok(image);
    assert.equal(typeof image.id, 'number');
    assert.equal(image.filename, name);
    assert.equal(typeof image.hashsum, 'string');
    assert.equal(image.path, hashedFilename);
    assert.equal(isNaN(new Date(image.createdAt)), false);
    assert.equal(isNaN(new Date(image.updatedAt)), false);
    assert.equal(Object.keys(image).length, 6);

    const files = await fsp.readdir(saveDir);
    assert.equal(files.length, 1, 'should save any file');
    assert.equal(files[0], hashedFilename);

    t.mock.timers.tick(2000);

    // try to upload the same file second time
    const resp2 = await request(imageUpload.route, {
      method: imageUpload.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: formData,
      isJson: false,
    });
    const body2 = await resp2.json();

    assert.equal(resp2.status, 200);
    assert.ok(Array.isArray(body2));

    const [image2] = body2;

    assert.ok(image2);
    assert.equal(image2.id, image.id);
    assert.equal(image2.filename, image.filename);
    assert.equal(image2.hashsum, image.hashsum);
    assert.equal(image2.path, image.path);
    assert.equal(image2.createdAt, image.createdAt);
    assert.notEqual(
      image2.updatedAt,
      image.updatedAt,
      'should update this column on duplicate image upload',
    );
    assert.equal(isNaN(new Date(image2.createdAt)), false);
    assert.equal(isNaN(new Date(image2.updatedAt)), false);
    assert.equal(Object.keys(image2).length, 6);

    const files2 = await fsp.readdir(saveDir);
    assert.equal(files2.length, 1, 'should save only 1 file');
    assert.match(files2[0], new RegExp(image.hashsum));
  });
});
