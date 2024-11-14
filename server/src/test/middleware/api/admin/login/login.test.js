import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../../helpers/getTestServer.js';

import * as login from '../../../../../middleware/api/admin/login/middleware.js';

import { seedAdmins } from '../../../../../db/seeders.js';
import { admin } from '../fixtures/admin.js';

describe('[api] login', async () => {
  test('should return 400 response if body misses some data', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(login.route, {
      method: login.method,
      body: { name: 'Jack' },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'WRONG_CREDENTIALS',
      message: 'Wrong credentials',
    });
  });

  test('should return 400 response if user is absent', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(login.route, {
      method: login.method,
      body: admin,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'WRONG_CREDENTIALS',
      message: 'Wrong credentials',
    });
  });

  test('should return 400 response if password is wrong', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(login.route, {
      method: login.method,
      body: { ...admin, password: '1234' },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'WRONG_CREDENTIALS',
      message: 'Wrong credentials',
    });
  });

  test('should return 200 and user data', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(login.route, {
      method: login.method,
      body: admin,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.ok(body.id, 'id exists');
    assert.equal(body.name, admin.name);
    assert.equal(Object.keys(body).length, 2);

    assert.match(
      resp.headers.get('set-cookies'),
      /token=/,
      'token cookie should be set',
    );
    assert.match(
      resp.headers.get('set-cookies'),
      /HttpOnly/i,
      'token cookie should be httpOnly',
    );
  });
});
