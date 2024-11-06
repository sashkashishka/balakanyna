import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../helpers/getTestServer.js';

import * as registration from '../../../../middleware/api/admin/registration.js';

import { seedAdmins } from '../../../../db/seeders.js';
import { admin } from './fixtures/admin.js';

describe('[api] registration', async () => {
  test('should return 403 if request was made from the restricted ip', async (t) => {
    const { request } = await getTestServer({
      t,
      config: { restrictions: { ip: '123' }, salt: { password: '123' } },
    });

    const resp = await request(registration.route, {
      method: registration.method,
      body: admin,
    });

    assert.equal(resp.status, 403);
  });

  test('should return 400 response if body misses some data', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(registration.route, {
      method: registration.method,
      body: { name: 'Jack' },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 response if duplicate user', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(registration.route, {
      method: registration.method,
      body: admin,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_USER',
      message: 'Cannot create user that is already exist',
    });
  });

  test('should return 200 and user data', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(registration.route, {
      method: registration.method,
      body: admin,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.ok(body.id, 'id exists');
    assert.equal(body.name, admin.name);
    assert.equal(Object.keys(body).length, 2);
  });
});
