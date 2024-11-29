import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as programCreate from '../../../../../../middleware/api/admin/program/create/middleware.js';

import { seedAdmins, seedUsers } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { getProgram } from '../../fixtures/program.js';
import { user } from '../../fixtures/user.js';

describe('[api] program create', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programCreate.route, {
      method: programCreate.method,
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

    const resp = await request(programCreate.route, {
      method: programCreate.method,
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

    const resp = await request(programCreate.route, {
      method: programCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Program',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if user does not exist', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const program = getProgram({ userId: 1 });

    const resp = await request(programCreate.route, {
      method: programCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: program,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'USER_DOES_NOT_EXIST',
      message: 'User does not exist',
    });
  });

  test('should return 200 and create duplicates without limitations', async (t) => {
    let dbUsers = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const program = getProgram({ userId: dbUsers[0].id });

    const resp = await request(programCreate.route, {
      method: programCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: program,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, program.name);
    assert.equal(body.userId, program.userId);
    assert.equal(body.startDatetime, program.startDatetime);
    assert.equal(body.expirationDatetime, program.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 8);

    // create duplicate
    const resp2 = await request(programCreate.route, {
      method: programCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: program,
    });
    const body2 = await resp2.json();

    assert.equal(resp2.status, 200);
    assert.equal(typeof body2.id, 'number');
    assert.notEqual(body2.id, body.id);
    assert.equal(body2.name, program.name);
    assert.equal(body2.userId, program.userId);
    assert.equal(body2.startDatetime, program.startDatetime);
    assert.equal(body2.expirationDatetime, program.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(isNaN(new Date(body2.createdAt)), false);
    assert.equal(isNaN(new Date(body2.updatedAt)), false);
    assert.equal(Object.keys(body2).length, 8);
  });
});
