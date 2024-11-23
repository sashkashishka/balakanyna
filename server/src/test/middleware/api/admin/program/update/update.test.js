import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as programUpdate from '../../../../../../middleware/api/admin/program/update/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';

describe('[api] program update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
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

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
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

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Task2',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if program does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 1,
        ...getProgram({ userId: 1 }),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 400 and validate that startDatetime should be lower than expirationDatetime', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: new Date().toISOString(),
      expirationDatetime: new Date(0).toISOString(),
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DATES_COMPLIANCE',
      message: 'Dates compliance',
    });
  });

  test('should update program and not overwrite user_id', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    const startDatetime = new Date();

    const payload = {
      id: dbPrograms[0].id,
      userId: 3,
      name: 'NewProgram',
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, payload.name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbPrograms[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbPrograms[0].createdAt).getTime(),
    );
  });
});
