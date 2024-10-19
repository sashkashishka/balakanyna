import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../helpers/getTestServer.js';

describe('[server] requestTimeout', async () => {
  test('should close socket if request timeout', async (t) => {
    async function noop() {}
    function connectMiddleware(router) {
      router.use(noop);
    }

    const instance = await getTestServer({
      t,
      connectMiddleware,
      config: {
        port: 1234,
        timeouts: {
          request: 100,
          close: 100,
          connection: 100,
        },
      },
    });

    let i = 0;

    try {
      await instance.request('/');

      i += 1;
    } catch (e) {
      assert.match(e.message, /fetch failed/);
    }

    assert.equal(i, 0, 'request should not be resolved');
  });
});
