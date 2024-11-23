import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../helpers/getTestServer.js';
import { dbStub } from '../../../helpers/db.js';
import { limitByIpMiddleware } from '../../../../middleware/auxiliary/limitByIp/middleware.js';

describe('[auxiliary] limit by ip', async () => {
  test('should throw 403 error if restrictions.ip is undefined', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: undefined,
        },
      },
      connectMiddleware: (router) => {
        router.use(limitByIpMiddleware);
      },
    });

    const resp = await request('/', { method: 'get'});
    const body = await resp.json();

    assert.equal(resp.status, 403);
    assert.deepEqual(body, { error: 'FORBIDDEN', message: 'Forbidden' });
  });

  test("should throw 403 error if restrictions.ip doesn't match", async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: '127.0.0.2',
        },
      },
      connectMiddleware: (router) => {
        router.use(limitByIpMiddleware);
      },
    });

    const resp = await request('/', { method: 'get'});
    const body = await resp.json();

    assert.equal(resp.status, 403);
    assert.deepEqual(body, { error: 'FORBIDDEN', message: 'Forbidden' });
  });

  test('should proceed to next middelware if ip is allowed', async (t) => {
    const answer = { ok: 1 };
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: '127.0.0.1',
        },
      },
      connectMiddleware: (router) => {
        router.use(limitByIpMiddleware);
        router.use((ctx) => {
          ctx.json(answer);
        });
      },
    });

    const resp = await request('/', { method: 'get'});
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, answer);
  });
});
