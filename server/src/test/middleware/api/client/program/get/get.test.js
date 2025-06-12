import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';

import * as programGet from '../../../../../../middleware/api/client/program/get/middleware.js';

import {
  seedPrograms,
  seedProgramTask,
  seedTasks,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { user } from '../../../admin/fixtures/user.js';
import { getProgram } from '../../../admin/fixtures/program.js';
import { tasks } from '../../../admin/fixtures/task.js';

function getEndpoint(baseUrl, params) {
  const url = getUrl(programGet.route, baseUrl);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  return url;
}

const hash = '0'.repeat(8);

describe('[api] client program get', async () => {
  test('should return 400 if search params are missing', async (t) => {
    const { request } = await getTestServer({ t });

    const resp = await request(programGet.route, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if search params are invalid', async (t) => {
    const { request, baseUrl } = await getTestServer({ t });

    const endpoint = getEndpoint(baseUrl, { foo: 1 });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test("should return 404 if program doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({ t });

    const endpoint = getEndpoint(baseUrl, { id: '12345678' });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 404 if pass real program id to search params', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
          }),
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].id });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 404 if program is expired', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
            start: new Date(new Date().getTime() - 100000),
            expiration: new Date(new Date().getTime() - 10000),
          }),
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].hash });

    const resp = await request(endpoint, {
      method: programGet.method,
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
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
            start: new Date(),
            expiration: new Date(new Date().getTime() + 100000),
          }),
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].hash });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id.length, 8);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(Object.keys(body).length, 2);
  });

  test('should return 200 and list of task ids', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];
    let dbProgramTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);

        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
            ],
            start: new Date(),
            expiration: new Date(new Date().getTime() + 100000),
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

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].hash });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id.length, 8);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 3);

    for (let i = 0; i < body.tasks.length; i++) {
      const task = body.tasks[i];
      const dbTask = dbTasks.find(
        (t) => t.id === dbPrograms[0].tasks[i].taskId,
      );

      assert.equal(
        task.id,
        dbTask.hash,
        'should be in the order that was saved',
      );
      assert.notEqual(
        dbProgramTasks.findIndex((t) => t.taskId === dbTask.id),
        -1,
      );
      assert.ok(task.id);
      assert.equal(Object.keys(task).length, 1);
    }

    assert.equal(Object.keys(body).length, 2);
  });

  test('should return 200 and list with repetetive tasks', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];
    let dbProgramTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);

        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
              { taskId: dbTasks[2].id },
            ],
            start: new Date(),
            expiration: new Date(new Date().getTime() + 100000),
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

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].hash });

    const resp = await request(endpoint, {
      method: programGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id.length, 8);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 4);

    assert.equal(
      body.tasks.filter((t) => t.id === dbTasks[2].hash).length,
      2,
      'should return repetetive tasks',
    );

    for (let i = 0; i < body.tasks.length; i++) {
      const task = body.tasks[i];
      const dbTask = dbTasks.find(
        (t) => t.id === dbPrograms[0].tasks[i].taskId,
      );

      assert.equal(
        task.id,
        dbTask.hash,
        'should be in the order that was saved',
      );
      assert.notEqual(
        dbProgramTasks.findIndex((t) => t.taskId === dbTask.id),
        -1,
      );
      assert.ok(task.id);
      assert.equal(Object.keys(task).length, 1);
    }

    assert.equal(Object.keys(body).length, 2);
  });
});
