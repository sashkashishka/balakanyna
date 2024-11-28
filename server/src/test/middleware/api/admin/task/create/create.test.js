import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { imageSliderTask, semaphoreTextTask } from '../../fixtures/task.js';

describe('[api] task create', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
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

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
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

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Task1',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if config already exists', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        ...imageSliderTask,
        name: 'Task New',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[0].id}`,
    });
  });

  test("should return 400 if passed config's keys unsorted", async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        ...imageSliderTask,
        name: 'Task New',
        config: {
          slides: [
            {
              image: {
                hashsum: 'aaa',
                filename: 'foo.jpeg',
                path: 'aaa.jpeg',
                id: 1,
              },
            },
          ],
          title: 'Hello',
        },
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[0].id}`,
    });
  });

  test("should sort config's keys before saving to the db", async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        type: 'semaphoreText',
        name: 'Task New',
        config: {
          colors: ['yellow'],
          delayRange: [3, 4],
          text: ['c'],
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
});
