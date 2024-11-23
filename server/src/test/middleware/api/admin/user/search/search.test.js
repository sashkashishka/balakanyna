import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as userSearch from '../../../../../../middleware/api/admin/user/search/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedUsers } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { users } from '../../fixtures/user.js';

function getEndpoint(baseUrl, { search } = {}) {
  const url = getUrl(userSearch.route, baseUrl);

  if (search) {
    url.searchParams.set('search', search);
  }

  return url;
}

describe('[api] user search', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(userSearch.route, {
      method: userSearch.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if search params failed validation', async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedUsers(db, users);
      },
    });

    const url = getEndpoint(baseUrl);

    const resp = await request(url, {
      method: userSearch.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  const testCases = [
    ['d', 2],
    ['i', 6],
  ];

  testCases.forEach(([search, expected]) => {
    test(`should return 200 and search ${search} in both name and surname`, async (t) => {
      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        search,
      });

      const resp = await request(url, {
        method: userSearch.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();

      assert.equal(resp.status, 200);
      assert.equal(body.length, expected);

      for (let i = 0; i < body.length; i++) {
        const regexp = new RegExp(search, 'i');
        const matchName = regexp.test(body[i].name);
        const matchSurname = regexp.test(body[i].surname);
        assert.ok(matchName || matchSurname);
      }
    });
  });

  test('should limit search for specified in config value', async (t) => {
    const limit = 2;
    const search = 'i';
    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        search: { limit },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedUsers(db, users);
      },
    });

    const url = getEndpoint(baseUrl, {
      search,
    });

    const resp = await request(url, {
      method: userSearch.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 0; i < body.length; i++) {
      const regexp = new RegExp(search, 'i');
      const matchName = regexp.test(body[i].name);
      const matchSurname = regexp.test(body[i].surname);
      assert.ok(matchName || matchSurname);
    }
  });
});
