import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { lettersToSyllableTask } from '../../fixtures/task.js';

describe('[api] task create lettersToSyllable', () => {
  test('should retun 400 if config is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...lettersToSyllableTask,
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
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = lettersToSyllableTask;

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

  test('should return 200 if vowelColor is absent', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...lettersToSyllableTask,
      config: {
        list: [{ first: 'b', last: 'c' }],
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
