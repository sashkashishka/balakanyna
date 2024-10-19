import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../helpers/getTestServer.js';

import * as healthcheck from '../../../middleware/api/healthcheck.js';

describe('[api] healthcheck', async () => {
  test('should return OK', async (t) => {
    const { request } = await getTestServer({ t });

    const resp = await request(healthcheck.route);

    const body = await resp.json();
    assert.deepEqual(body, { health: 'OK' }, 'should return proper json');
  });
});
