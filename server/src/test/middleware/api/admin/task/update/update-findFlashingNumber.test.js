import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { findFlashingNumberTask } from '../../fixtures/task.js';

const hash = '88888888';

describe('[api] task update findFlashingNumber', () => {
  test('should retun 400 if config is invalid', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [findFlashingNumberTask]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      config: {
        foo: 1,
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

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_TASK_CONFIG',
      message: `Invalid task config for ${payload.type}`,
    });
  });

  test('should return 400 if pass wrong type', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [findFlashingNumberTask]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'BrandNewName',
      config: {
        list: [
          {
            first: 'bbb',
            last: 'baz',
          },
        ],
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

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DIFFERENT_TASK_TYPE',
      message: 'Different task type',
    });
  });

  test('should return 400 if pass wrong type but proper config for those type', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [findFlashingNumberTask]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'BrandNewName',
      config: {
        colors: ['123'],
        text: ['a'],
        delayRange: [1, 2],
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

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DIFFERENT_TASK_TYPE',
      message: 'Different task type',
    });
  });

  test('should return 400 if positionalDigints are not withing the range', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [findFlashingNumberTask]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      config: {
        ...findFlashingNumberTask.config,
        positionalDigit: { min: 1, max: 5 },
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

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_TASK_CONFIG',
      message: `Invalid task config for ${payload.type}`,
    });
  });

  test('should return 400 if positionalDigints are not withing the range 2', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [findFlashingNumberTask]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      config: {
        ...findFlashingNumberTask.config,
        positionalDigit: { min: 5, max: 1 },
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

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_TASK_CONFIG',
      message: `Invalid task config for ${payload.type}`,
    });
  });

  test('should return 200 and update task', async (t) => {
    const prefix = 'foo';
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...findFlashingNumberTask, hash }]);
      },
    });

    const payload = {
      ...findFlashingNumberTask,
      id: dbTasks[0].id,
      name: 'BrandNewName',
      config: {
        duration: 120,
        streak: { length: 5 },
        animation: {
          min: 7000,
          max: 8000,
        },
        positionalDigit: {
          min: 3,
          max: 4,
        },
        y: {
          min: 3,
          max: 6,
        },
        x: {
          min: 4,
          max: 5,
        },
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
    assert.equal(body.id, payload.id);
    assert.equal(body.hash, hash, 'should preserve hash');
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.deepEqual(body.config.list, payload.config.list);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });
});
