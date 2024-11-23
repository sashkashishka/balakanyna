import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../helpers/getTestServer.js';
import { dbStub } from '../../../helpers/db.js';
import { receiveJsonBodyMiddleware } from '../../../../middleware/auxiliary/receiveJsonBody/middleware.js';

describe('[auxiliary] receive json body', async () => {
  test('should store undefined to ctx.body if there is no body in the request', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(receiveJsonBodyMiddleware);
        router.use((ctx) => {
          assert.equal(ctx.body, undefined);
          ctx.json(ctx.body);
        });
      },
    });

    const resp = await request('/', {
      method: 'GET',
      headers: { 'content-type': 'text/plain' },
    });

    assert.equal(resp.status, 200);
  });

  test('should store null to ctx.body if get request but content type is json', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(receiveJsonBodyMiddleware);
        router.use((ctx) => {
          assert.equal(ctx.body, null);
          ctx.json(ctx.body);
        });
      },
    });

    const resp = await request('/', { method: 'get' });

    assert.equal(resp.status, 200);
  });

  test('should store null to ctx.body if there is no body is empty string', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(receiveJsonBodyMiddleware);
        router.use((ctx) => {
          assert.equal(ctx.body, null);
          ctx.json(ctx.body);
        });
      },
    });

    const resp = await request('/', { method: 'POST', body: '' });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, null);
  });

  test('should store json to ctx.body if exists', async (t) => {
    const payload = { foo: 'bar', baz: '123' };

    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      connectMiddleware: (router) => {
        router.use(receiveJsonBodyMiddleware);
        router.use((ctx) => {
          assert.deepEqual(ctx.body, payload);
          ctx.json(ctx.body);
        });
      },
    });

    const resp = await request('/', { method: 'POST', body: payload });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, payload);
  });
});
