import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { schulteTableTask } from '../../fixtures/task.js';

describe('[api] task create wordwall', () => {
  test('should retun 400 if config is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...schulteTableTask,
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

    const payload = schulteTableTask;

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
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.equal(body.config.x, payload.config.x);
    assert.equal(body.config.y, payload.config.y);
    assert.equal(body.config.reverse, payload.config.reverse);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 8);
  });
});

