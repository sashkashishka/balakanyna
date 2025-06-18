import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { goneAndFoundTask } from '../../fixtures/task.js';

const hash = '88888888';

describe('[api] task update goneAndFound', () => {
  test('should retun 400 if config is invalid', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [goneAndFoundTask]);
      },
    });

    const payload = {
      ...goneAndFoundTask,
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
        dbTasks = await seedTasks(db, [goneAndFoundTask]);
      },
    });

    const payload = {
      ...goneAndFoundTask,
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
        dbTasks = await seedTasks(db, [goneAndFoundTask]);
      },
    });

    const payload = {
      ...goneAndFoundTask,
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

  [
    { items: { min: 0, max: 11 } },
    { items: { min: 1, max: 12 } },
    { items: { min: 11, max: 0 } },
    { items: { min: 12, max: 1 } },
    { limit: { type: 'timer', value: 0 } },
    { y: { min: 2, max: 5 } },
    { y: { min: 3, max: 6 } },
    { y: { min: 5, max: 2 } },
    { y: { min: 6, max: 3 } },
  ].forEach((configPart, i) => {
    test(`should return 400 if items are not withing the range ${i}`, async (t) => {
      let dbTasks = [];

      const { request } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          dbTasks = await seedTasks(db, [goneAndFoundTask]);
        },
      });

      const payload = {
        ...goneAndFoundTask,
        id: dbTasks[0].id,
        config: {
          ...goneAndFoundTask.config,
          ...configPart,
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
  });

  test('should return 200 and update task', async (t) => {
    const prefix = 'foo';
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...goneAndFoundTask, hash }]);
      },
    });

    const payload = {
      ...goneAndFoundTask,
      id: dbTasks[0].id,
      name: 'BrandNewName',
      config: {
        preset: 'default',
        streak: { length: 5 },
        items: {
          min: 3,
          max: 6,
        },
        limit: {
          type: 'rounds',
          value: 15,
        },
        y: {
          min: 3,
          max: 4,
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
