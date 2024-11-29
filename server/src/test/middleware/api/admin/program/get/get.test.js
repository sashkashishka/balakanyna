import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as programGet from '../../../../../../middleware/api/admin/program/get/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedProgramTask,
  seedTasks,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';
import { tasks } from '../../fixtures/task.js';

function getEndpoint(baseUrl, { id }) {
  const url = getUrl(programGet.route, baseUrl);

  url.searchParams.set('id', id);

  return url;
}

describe('[api] program get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(programGet.route, {
      method: programGet.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if search params are missing', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programGet.route, {
      method: programGet.method,
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

  test('should return 404 if search parasm are invalid', async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 'boo' });

    const resp = await request(endpoint, {
      method: programGet.method,
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

  test("should return 404 if program doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 1 });

    const resp = await request(endpoint, {
      method: programGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 200', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({
            userId: dbUsers[0].id,
          }),
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].id });

    const resp = await request(endpoint, {
      method: programGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId);
    assert.equal(body.startDatetime, dbPrograms[0].startDatetime);
    assert.equal(body.expirationDatetime, dbPrograms[0].expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(isNaN(new Date(body.startDatetime)), false);
    assert.equal(isNaN(new Date(body.expirationDatetime)), false);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 8);
  });

  test('should return 200 and list of task ids', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];
    let dbProgramTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);

        dbPrograms = await seedPrograms(db, [
          getProgram({
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
            ],
          }),
        ]);

        dbProgramTasks = await seedProgramTask(db, [
          {
            taskId: dbTasks[0].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[1].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[2].id,
            programId: dbPrograms[0].id,
          },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].id });

    const resp = await request(endpoint, {
      method: programGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId);
    assert.equal(body.startDatetime, dbPrograms[0].startDatetime);
    assert.equal(body.expirationDatetime, dbPrograms[0].expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 3);

    for (let i = 0; i < body.tasks.length; i++) {
      const task = body.tasks[i];

      assert.equal(
        task.id,
        dbPrograms[0].tasks[i].taskId,
        'should be in the order that was saved',
      );
      assert.notEqual(
        dbProgramTasks.findIndex((t) => t.taskId === task.id),
        -1,
      );
      assert.ok(task.name);
      assert.ok(task.type);
      assert.ok(task.config);
      assert.ok(task.createdAt);
      assert.ok(task.updatedAt);
      assert.equal(Object.keys(task).length, 6);
    }

    assert.equal(isNaN(new Date(body.startDatetime)), false);
    assert.equal(isNaN(new Date(body.expirationDatetime)), false);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 8);
  });

  test('should return 200 and list with repetetive tasks', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];
    let dbProgramTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);

        dbPrograms = await seedPrograms(db, [
          getProgram({
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
              { taskId: dbTasks[2].id },
            ],
          }),
        ]);

        dbProgramTasks = await seedProgramTask(db, [
          {
            taskId: dbTasks[0].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[1].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[2].id,
            programId: dbPrograms[0].id,
          },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].id });

    const resp = await request(endpoint, {
      method: programGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId);
    assert.equal(body.startDatetime, dbPrograms[0].startDatetime);
    assert.equal(body.expirationDatetime, dbPrograms[0].expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 4);

    assert.equal(
      body.tasks.filter((t) => t.id === dbTasks[2].id).length,
      2,
      'should return repetetive tasks',
    );

    for (let i = 0; i < body.tasks.length; i++) {
      const task = body.tasks[i];

      assert.equal(
        task.id,
        dbPrograms[0].tasks[i].taskId,
        'should be in the order that was saved',
      );
      assert.notEqual(
        dbProgramTasks.findIndex((t) => t.taskId === task.id),
        -1,
      );
      assert.ok(task.name);
      assert.ok(task.type);
      assert.ok(task.config);
      assert.ok(task.createdAt);
      assert.ok(task.updatedAt);
      assert.equal(Object.keys(task).length, 6);
    }

    assert.equal(isNaN(new Date(body.startDatetime)), false);
    assert.equal(isNaN(new Date(body.expirationDatetime)), false);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 8);
  });
});
