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
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const payload = {
      id: dbUsers[0].id,
      name: 'Bob',
      surname: 'Mortimer',
      grade: 2,
      birthdate: new Date().toISOString(),
      notes: 'foo',
      phoneNumber: '+23498234',
      email: 'foo@bar.baz',
      messangers: 'tg',
    };

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbUsers[0].id);
    assert.equal(body.name, payload.name);
    assert.equal(body.surname, payload.surname);
    assert.equal(body.grade, payload.grade);
    assert.equal(body.birthdate, payload.birthdate);
    assert.equal(body.notes, payload.notes);
    assert.equal(body.phoneNumber, payload.phoneNumber);
    assert.equal(body.email, payload.email);
    assert.equal(body.messangers, payload.messangers);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 11);

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbUsers[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbUsers[0].createdAt).getTime(),
    );
  });

  test('should not clear non required fields if they was not sent', async (t) => {
    let dbUsers = [];
    const customUser = {
      ...user,
      notes: 'boo',
      email: 'lolo@gmail.com',
    };

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [customUser]);
      },
    });

    const payload = {
      id: dbUsers[0].id,
      name: 'Bob',
      surname: 'Mortimer',
      grade: 2,
      notes: undefined,
      email: null,
      birthdate: new Date().toISOString(),
      phoneNumber: '+23498234',
      messangers: 'tg',
    };

    const resp = await request(userUpdate.route, {
      method: userUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbUsers[0].id);
    assert.equal(body.name, payload.name);
    assert.equal(body.surname, payload.surname);
    assert.equal(body.grade, payload.grade);
    assert.equal(body.birthdate, payload.birthdate);
    assert.equal(body.phoneNumber, payload.phoneNumber);
    assert.equal(body.messangers, payload.messangers);
    assert.equal(
      body.notes,
      dbUsers[0].notes,
      'should remain the same as before',
    );
    assert.equal(
      body.email,
      dbUsers[0].email,
      'should remain the same as before',
    );
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 11);

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbUsers[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbUsers[0].createdAt).getTime(),
    );
  });
});
