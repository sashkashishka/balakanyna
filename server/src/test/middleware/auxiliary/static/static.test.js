import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { getTestServer } from '../../../helpers/getTestServer.js';
import { dbStub } from '../../../helpers/db.js';
import { createStaticMiddleware } from '../../../../middleware/auxiliary/static/middleware.js';

const defaultNotFound = await fsp.readFile(
  path.resolve(
    import.meta.dirname,
    '../../../../middleware/auxiliary/static/notFound.html',
  ),
  'utf8',
);
const fooFile = await fsp.readFile(
  path.resolve(import.meta.dirname, './fixtures/foo.txt'),
  'utf8',
);
const indexFile = await fsp.readFile(
  path.resolve(import.meta.dirname, './fixtures/index.html'),
  'utf8',
);

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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('content-type'), 'text/plain');

    const body = await resp.text();

    assert.equal(body, fooFile);
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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 404);
    const body = await resp.text();
    assert.deepEqual(body, defaultNotFound);
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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 404);
    const body = await resp.text();
    assert.deepEqual(body, defaultNotFound);
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

    const resp = await request(file, { method: 'get' });

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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 500);
    const body = await resp.json();
    assert.deepEqual(body, {
      error: 'FILE_STREAM_ERROR',
      message: 'File stream error',
    });
    assert.equal(spyDestroy.mock.calls.length, 1);
  });

  ['/foo', '/foo/bar', '/foo/bar/bar/foo/doo', '/foo/', '/index'].forEach(
    (file) => {
      test(`should return index.html file ${file} if url without extension and notFound options is index`, async (t) => {
        const dir = path.resolve(import.meta.dirname, './fixtures');
        const prefix = '/bar';
        const notFound = 'index';

        const fsStat = fsp.stat;
        const fsCreateReadStream = fs.createReadStream;

        const { request } = await getTestServer({
          t,
          deps: { db: dbStub },
          connectMiddleware: (router) => {
            router.use(
              createStaticMiddleware(
                { dir, prefix, notFound },
                { fsStat, fsCreateReadStream },
              ),
            );
          },
        });

        const resp = await request(`${prefix}${file}`, { method: 'get' });

        assert.equal(resp.status, 200);
        assert.equal(resp.headers.get('content-type'), 'text/html');

        const body = await resp.text();

        assert.equal(body, indexFile);
      });

      test('should fallback to default notFound if index.html does not exist', async (t) => {
        const dir = path.join(import.meta.dirname, './foo');
        const prefix = '/bar';
        const notFound = 'index';

        const fsStat = fsp.stat;
        const fsCreateReadStream = fs.createReadStream;

        const { request } = await getTestServer({
          t,
          deps: { db: dbStub },
          connectMiddleware: (router) => {
            router.use(
              createStaticMiddleware(
                { dir, prefix, notFound },
                { fsStat, fsCreateReadStream },
              ),
            );
          },
        });

        const resp = await request(`${prefix}${file}`, { method: 'get' });

        assert.equal(resp.status, 200);
        assert.equal(resp.headers.get('content-type'), 'text/html');

        const body = await resp.text();

        assert.equal(body, defaultNotFound);
      });
    },
  );

  ['/foo.ts', '/foo/bar.mfs', '/index.trew'].forEach((file) => {
    test(`should return index.html file ${file} if url with unknown extension and notFound options is index`, async (t) => {
      const dir = path.resolve(import.meta.dirname, './fixtures');
      const prefix = '/bar';
      const notFound = 'index';

      const fsStat = fsp.stat;
      const fsCreateReadStream = fs.createReadStream;

      const { request } = await getTestServer({
        t,
        deps: { db: dbStub },
        connectMiddleware: (router) => {
          router.use(
            createStaticMiddleware(
              { dir, prefix, notFound },
              { fsStat, fsCreateReadStream },
            ),
          );
        },
      });

      const resp = await request(`${prefix}${file}`, { method: 'get' });

      assert.equal(resp.status, 404);
      assert.equal(resp.headers.get('content-type'), 'text/html');

      const body = await resp.text();

      assert.equal(body, indexFile);
    });

    test('should fallback to default notFound if index.html does not exist', async (t) => {
      const dir = path.join(import.meta.dirname, './foo');
      const prefix = '/bar';
      const notFound = 'index';

      const fsStat = fsp.stat;
      const fsCreateReadStream = fs.createReadStream;

      const { request } = await getTestServer({
        t,
        deps: { db: dbStub },
        connectMiddleware: (router) => {
          router.use(
            createStaticMiddleware(
              { dir, prefix, notFound },
              { fsStat, fsCreateReadStream },
            ),
          );
        },
      });

      const resp = await request(`${prefix}${file}`, { method: 'get' });

      assert.equal(resp.status, 404);
      assert.equal(resp.headers.get('content-type'), 'text/html');

      const body = await resp.text();

      assert.equal(body, defaultNotFound);
    });
  });

  test('should return 200 if prefix is empty string', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '';
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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('content-type'), 'text/plain');

    const body = await resp.text();

    assert.equal(body, fooFile);
  });

  test('should return 500 if unexpected error occures during processing', async (t) => {
    const dir = path.resolve(import.meta.dirname, './fixtures');
    const prefix = '';
    const file = `${prefix}/foo.txt`;

    const fsStat = fsp.stat;
    const fsCreateReadStream = t.mock.fn(fs.createReadStream, () => ({
      pipe: '1',
    }));

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

    const resp = await request(file, { method: 'get' });

    assert.equal(resp.status, 500);
    assert.equal(resp.headers.get('content-type'), 'application/json');

    const body = await resp.json();

    assert.equal(body.error, 'TypeError');
  });
});
