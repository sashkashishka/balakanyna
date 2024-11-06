import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../helpers/getTestServer.js';

import * as logout from '../../../../middleware/api/admin/logout.js';

describe('[api] logout', async () => {
  test('should remove token cookie and respond with ok', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(logout.route, {
      method: logout.method,
      cookie: 'token=12345',
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, { ok: true });

    assert.equal(resp.headers.get('set-cookies'), 'token=');
  });
});
