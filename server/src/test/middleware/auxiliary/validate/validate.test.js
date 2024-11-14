import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../helpers/getTestServer.js';

import { receiveJsonBodyMiddleware } from '../../../../middleware/auxiliary/receiveJsonBody/middleware.js';
import { createValidateMiddleware } from '../../../../middleware/auxiliary/validate/middleware.js';
import { createError } from '../../../../core/errors.js';

const errCode = 'CUSTOM_ERROR';
const errMsg = 'Custom error';
const statusCode = 489;
const ERR_CUSTOM = createError(errCode, errMsg, statusCode);

const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'integer',
    },
    bar: {
      type: 'integer',
    },
  },
  required: ['foo', 'bar'],
};

describe('[middleware] validate middleware', () => {
  test('should throw provided error if validation failed', async (t) => {
    const mockGetter = t.mock.fn((ctx) => ctx.body);
    const mockMiddleware = t.mock.fn(ctx => ctx.json({ ok: 1 }));

    const { request } = await getTestServer({
      t,
      connectMiddleware(router) {
        router.use(receiveJsonBodyMiddleware);
        router.use(createValidateMiddleware(mockGetter, schema, ERR_CUSTOM));
        router.use(mockMiddleware);
      },
    });

    const resp = await request(`/${Date.now()}`, {
      method: 'post',
      body: {
        foo: 1,
        bar: 'boo',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, statusCode);
    assert.deepEqual(body, { error: errCode, message: errMsg });

    assert.equal(mockGetter.mock.callCount(), 1);
    assert.equal(mockMiddleware.mock.callCount(), 0);
  });

  test('should pass validation and proceed to next middleware', async (t) => {
    const mockGetter = t.mock.fn((ctx) => ctx.body);
    const mockMiddleware = t.mock.fn((ctx) => ctx.json({ ok: 1 }));

    const { request } = await getTestServer({
      t,
      connectMiddleware(router) {
        router.use(receiveJsonBodyMiddleware);
        router.use(createValidateMiddleware(mockGetter, schema, ERR_CUSTOM));
        router.use(mockMiddleware);
      },
    });

    const resp = await request(`/${Date.now()}`, {
      method: 'post',
      body: {
        foo: 1,
        bar: 2,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, { ok: 1 });

    assert.equal(mockGetter.mock.callCount(), 1);
    assert.equal(mockMiddleware.mock.callCount(), 1);
  });
});
