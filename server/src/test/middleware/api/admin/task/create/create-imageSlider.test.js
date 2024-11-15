import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie, sleep } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { sliderTask } from '../../fixtures/task.js';

describe('[api] task create slider', () => {
  test('should retun 400 if config is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...sliderTask,
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

  test('should return 200 and create task', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: sliderTask,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, sliderTask.name);
    assert.equal(body.type, sliderTask.type);
    assert.deepEqual(body.config, sliderTask.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });

  test('should return 200 and create duplicate task', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [sliderTask]);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: sliderTask,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.notEqual(body.id, dbTasks[0].id);
    assert.equal(body.name, dbTasks[0].name);
    assert.equal(body.type, dbTasks[0].type);
    assert.deepEqual(body.config, dbTasks[0].config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });
});
