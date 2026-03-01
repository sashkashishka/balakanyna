import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { semaphoreTextTask, tasks } from '../../fixtures/task.js';
import { assertCommonTaskProps } from '../utils.js';

const hash = '88888888';

describe('[api] task update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
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

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
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

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
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

  test('should return 404 if task does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 300,
        type: semaphoreTextTask.type,
        config: semaphoreTextTask.config,
        name: semaphoreTextTask.name,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 200 if update the same task', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);
      },
    });

    const payload = {
      id: dbTasks[0].id,
      name: 'Task New',
      type: dbTasks[0].type,
      config: dbTasks[0].config,
    };

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.hash, hash, 'should preserve hash');
    assertCommonTaskProps(body, payload);
    assert.deepEqual(body.config, payload.config);

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbTasks[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbTasks[0].createdAt).getTime(),
    );
  });

  test('should return 400 if config already exists', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, tasks);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: dbTasks[0].id,
        name: 'Task New',
        type: dbTasks[0].type,
        config: dbTasks[1].config,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[1].id}`,
    });
  });

  test("should return 400 if passed config's keys unsorted", async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, tasks);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: dbTasks[0].id,
        type: dbTasks[0].type,
        name: 'Task New',
        config: {
          title: 'Hello2',
          slides: [
            {
              image: {
                id: 2,
              },
            },
          ],
        },
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[1].id}`,
    });
  });

  test("should sort config's keys before saving to the db", async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: dbTasks[0].id,
        type: 'semaphoreText',
        name: 'Task New',
        config: {
          colors: ['yellow'],
          text: ['c'],
          delayRange: [3, 4],
        },
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(
      JSON.stringify(body.config),
      '{"colors":["yellow"],"delayRange":[3,4],"text":["c"]}',
    );
  });

  test('should return 200 and update task', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);
      },
    });

    const payload = {
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'Brand new Task',
      config: {
        colors: ['yellow'],
        text: ['c'],
        delayRange: [3, 4],
      },
    };

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.hash, hash, 'should preserve hash');
    assertCommonTaskProps(body, payload);
    assert.deepEqual(body.config, payload.config);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbTasks[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbTasks[0].createdAt).getTime(),
    );
  });

  test('should accept timer property, return 200 and update task', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);
      },
    });

    const payload = {
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'Brand new Task',
      config: {
        colors: ['yellow'],
        timer: { duration: 2000 },
        text: ['c'],
        delayRange: [3, 4],
      },
    };

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.hash, hash, 'should preserve hash');
    assertCommonTaskProps(body, payload);
    assert.deepEqual(body.config, payload.config);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbTasks[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbTasks[0].createdAt).getTime(),
    );
  });
});
