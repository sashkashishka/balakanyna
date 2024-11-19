import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../utils/network.js';
import { getTestServer } from '../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../helpers/utils.js';

import * as adminGet from '../../../../../middleware/api/admin/get/middleware.js';

import { seedAdmins } from '../../../../../db/seeders.js';

import { admin } from '../fixtures/admin.js';

function getEndpoint(baseUrl) {
  const url = getUrl(adminGet.route, baseUrl);

  return url;
}

describe('[api] admin get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(adminGet.route, {
      method: adminGet.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 200 and existing admin', async (t) => {
    let dbAdmins = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        dbAdmins = await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl);

    const resp = await request(endpoint, {
      method: adminGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, dbAdmins[0].name);
    assert.equal(Object.keys(body).length, 2);
  });
});
