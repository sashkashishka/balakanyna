import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as userUpdate from '../../../../../../middleware/api/admin/user/update/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedUsers } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';

describe('[api] user update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if body is missing', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
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

  test('should return 400 if body is not full', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Sarah',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if user does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedUsers(db, [user]);
      },
    });

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 300,
        ...user,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'USER_DOES_NOT_EXIST',
      message: 'User does not exist',
    });
  });

  test('should return 200 when user successfuly updated', async (t) => {
    let dbUsers = [];

    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const name = 'Bob';
    const surname = 'Mortimer';

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: dbUsers[0].id,
        name,
        surname,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbUsers[0].id);
    assert.equal(body.name, name);
    assert.equal(body.surname, surname);
    assert.equal(Object.keys(body).length, 3);
  });
});
