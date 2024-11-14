import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../helpers/getTestServer.js';

describe('[middleware] not found', async () => {
  test('should return 404 if route not found', async (t) => {
    const { request } = await getTestServer({ t });

    const resp = await request(`/${Date.now()}`);

    assert.equal(resp.status, 404);
    const body = await resp.json();
    assert.deepEqual(
      body,
      { error: 'NOT_FOUND', message: 'Not Found' },
      'should return proper json',
    );
  });
});
