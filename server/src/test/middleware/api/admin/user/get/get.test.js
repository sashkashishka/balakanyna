import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as userGet from '../../../../../../middleware/api/admin/user/get/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedUsers } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';

describe('[api] user get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let dbUsers = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const url = getUrl(userGet.route, baseUrl);

    const resp = await request(url, {
      method: userGet.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if missing id query', async (t) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let dbUsers = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const url = getUrl(userGet.route, baseUrl);

    const resp = await request(url, {
      method: userGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'USER_DOES_NOT_EXIST',
      message: 'User does not exist',
    });
  });

  test("should return 400 if user doesn't exist", async (t) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let dbUsers = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const url = getUrl(userGet.route, baseUrl);
    url.searchParams.set('id', 300);

    const resp = await request(url, {
      method: userGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'USER_DOES_NOT_EXIST',
      message: 'User does not exist',
    });
  });

  test('should return 200 and existing user', async (t) => {
    let dbUsers = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const url = getUrl(userGet.route, baseUrl);
    url.searchParams.set('id', dbUsers[0].id);

    const resp = await request(url, {
      method: userGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, user.name);
    assert.equal(body.surname, user.surname);
    assert.equal(Object.keys(body).length, 3);
  });
});
