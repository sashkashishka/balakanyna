import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as linkTaskProgram from '../../../../../../middleware/api/admin/link/taskProgram/middleware.js';

import { programTaskTable } from '../../../../../../db/schema.js';
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
      taskOrder: 1,
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
      taskOrder: 1,
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

  test('should return 200 if such record already exist and update taskOrder', async (t) => {
    let dbPrograms = [];
    let dbTasks = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
          getProgram({ userId: dbUsers[0].id }),
        ]);
        dbTasks = await seedTasks(db, [imageSliderTask]);
        await seedProgramTask(db, [
          { taskId: dbTasks[0].id, programId: dbPrograms[0].id, taskOrder: 0 },
          { taskId: dbTasks[0].id, programId: dbPrograms[1].id, taskOrder: 0 },
        ]);
      },
    });

    const payload = {
      programId: dbPrograms[0].id,
      taskId: dbTasks[0].id,
      taskOrder: 1,
    };

    const resp = await request(linkTaskProgram.route, {
      method: linkTaskProgram.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const programTaskList = await db.select().from(programTaskTable)

    assert.equal(programTaskList.length, 2);

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.taskId, payload.taskId);
    assert.equal(body.programId, payload.programId);
    assert.equal(body.taskOrder, payload.taskOrder);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
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
      taskOrder: 1,
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
    assert.equal(body.taskOrder, payload.taskOrder);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });
});
