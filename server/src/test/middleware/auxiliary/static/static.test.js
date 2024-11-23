import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { getTestServer } from '../../../helpers/getTestServer.js';
import { dbStub } from '../../../helpers/db.js';
import { createStaticMiddleware } from '../../../../middleware/auxiliary/static/middleware.js';

describe('[auxiliary] serve static files', async () => {
  test('should send content type header', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '/bar';
    const file = `${prefix}/foo.txt`;

    const fsStat = fsp.stat;
    const fsCreateReadStream = fs.createReadStream;

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(
          createStaticMiddleware(
            { dir, prefix },
            { fsStat, fsCreateReadStream },
          ),
        );
      },
    });

    const resp = await request(file, { method: 'get'});

    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('content-type'), 'text/plain');

    const body = await resp.text();

    assert.equal(body, 'Foo is not bar\n');
  });

  test('should return 404 if file not found', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '/bar';
    const file = `${prefix}/foo-imaginary.txt`;

    const fsStat = fsp.stat;
    const fsCreateReadStream = fs.createReadStream;

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(
          createStaticMiddleware(
            { dir, prefix },
            { fsStat, fsCreateReadStream },
          ),
        );
      },
    });

    const resp = await request(file, { method: 'get'});

    assert.equal(resp.status, 404);
    const body = await resp.json();
    assert.deepEqual(body, { error: 'NOT_FOUND', message: 'Not Found' });
  });

  test('should return 404 if accesing dotfile', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '/bar';
    const file = `${prefix}/.foo`;

    const fsStat = fsp.stat;
    const fsCreateReadStream = fs.createReadStream;

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(
          createStaticMiddleware(
            { dir, prefix },
            { fsStat, fsCreateReadStream },
          ),
        );
      },
    });

    const resp = await request(file, { method: 'get'});

    assert.equal(resp.status, 404);
    const body = await resp.json();
    assert.deepEqual(body, { error: 'NOT_FOUND', message: 'Not Found' });
  });

  test('should return 404 if a prefix does not match', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '/bar';
    const file = `/baz/foo.txt`;

    const fsStat = fsp.stat;
    const fsCreateReadStream = fs.createReadStream;

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(
          createStaticMiddleware(
            { dir, prefix },
            { fsStat, fsCreateReadStream },
          ),
        );
      },
    });

    const resp = await request(file, { method: 'get'});

    assert.equal(resp.status, 404);
    const body = await resp.json();
    assert.deepEqual(body, { error: 'NOT_FOUND', message: 'Not Found' });
  });

  test('should destroy stream if error occured while reading file', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '/bar';
    const file = `${prefix}/foo.txt`;

    const spyDestroy = t.mock.fn();

    const fsStat = fsp.stat;
    const fsCreateReadStream = (filepath, options) => {
      const stream = fs.createReadStream(filepath, options);

      const originalDestroy = stream.destroy.bind(stream);

      stream.destroy = () => {
        spyDestroy();
        originalDestroy();
      };

      stream.on('open', () => {
        stream.emit('error', new Error('read error'));
      });

      return stream;
    };

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(
          createStaticMiddleware(
            { dir, prefix },
            { fsStat, fsCreateReadStream },
          ),
        );
      },
    });

    const resp = await request(file, { method: 'get'});

    assert.equal(resp.status, 500);
    const body = await resp.json();
    assert.deepEqual(body, {
      error: 'FILE_STREAM_ERROR',
      message: 'File stream error',
    });
    assert.equal(spyDestroy.mock.calls.length, 1);
  });
});
