import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { goneAndFoundTask } from '../../fixtures/task.js';

describe('[api] task create goneAndFound', () => {
  test('should retun 400 if config is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...goneAndFoundTask,
      config: {
        foo: 1,
      },
    };

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
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
      const { request } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
        },
      });

      const payload = {
        ...goneAndFoundTask,
        config: {
          ...goneAndFoundTask.config,
          ...configPart,
        },
      };

      const resp = await request(taskCreate.route, {
        method: taskCreate.method,
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

  test('should return 200 and create task', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = goneAndFoundTask;

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.deepEqual(body.config.list, payload.config.list);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });
});
