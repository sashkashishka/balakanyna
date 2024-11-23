import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../helpers/getTestServer.js';

describe('[core] context', async () => {
  test('should return 500 if json stringify fails', async (t) => {
    const route = '/fail-stringify';
    function failStringify(ctx) {
      ctx.json({ test: BigInt(123) });
    }
    function connectMiddleware(router) {
      router.get(route, failStringify);
    }

    const instance = await getTestServer({
      t,
      connectMiddleware,
    });

    const resp = await instance.request(route, { method: 'get' });

    assert.equal(resp.status, 500);
    const body = await resp.json();
    assert.equal(body.error, 'FAILED_SERIALIZATION');
    assert.match(body.message, /Failed serialization/);
  });
});
