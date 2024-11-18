import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as linkTaskProgram from '../../../../../../middleware/api/admin/link/taskProgram/middleware.js';

import {
  seedAdmins,
  seedUsers,
  seedPrograms,
  seedTasks,
  seedProgramTask,
} from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';
import { imageSliderTask } from '../../fixtures/task.js';

describe('[api] link task program', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
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

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
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

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        taskId: 1,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if program does not exist', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      programId: 1,
      taskId: 2,
    };

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: 'Missing entity: program',
    });
  });

  test('should return 400 if task does not exist', async (t) => {
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    const payload = {
      programId: dbPrograms[0].id,
      taskId: 2,
    };

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: `Missing entity: task`,
    });
  });

  test('should return 400 if such record already exist', async (t) => {
    let dbPrograms = [];
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
        dbTasks = await seedTasks(db, [imageSliderTask]);
        await seedProgramTask(db, [
          { taskId: dbTasks[0].id, programId: dbPrograms[0].id },
        ]);
      },
    });

    const payload = {
      programId: dbPrograms[0].id,
      taskId: dbTasks[0].id,
    };

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_MANY_TO_MANY_RELATION',
      message: 'Duplicate many to many relation',
    });
  });

  test('should return 200', async (t) => {
    let dbPrograms = [];
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      programId: dbPrograms[0].id,
      taskId: dbTasks[0].id,
    };

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.taskId, payload.taskId);
    assert.equal(body.programId, payload.programId);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 5);
  });
});
