import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../helpers/getTestServer.js';
import { dbStub } from '../../helpers/db.js';
import { verifyTokenMiddleware } from '../../../middleware/auxiliary/jwt.js';
import { Jwt } from '../../../core/context.js';

describe('[auxiliary] verify token middleware', async () => {
  test('should throw 401 error if token is absent', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: undefined,
        },
      },
      connectMiddleware: (router) => {
        router.use(verifyTokenMiddleware);
      },
    });

    const resp = await request('/');
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should throw 401 error if token is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: undefined,
        },
      },
      connectMiddleware: (router) => {
        router.use(verifyTokenMiddleware);
      },
    });

    const resp = await request('/', {
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should proceed to next middleware if token is valid', async (t) => {
    const answer = { ok: 2 };
    const { request, config } = await getTestServer({
      t,
      deps: { db: dbStub },
      config: {
        restrictions: {
          ip: undefined,
        },
      },
      connectMiddleware: (router) => {
        router.use(verifyTokenMiddleware);
        router.use((ctx) => ctx.json(answer));
      },
    });

    const jwt = new Jwt(config.jwt);
    const token = await jwt.sign({});

    const resp = await request('/', {
      headers: {
        cookie: `token=${token}`,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, answer);
  });
});
