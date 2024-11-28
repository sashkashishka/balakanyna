import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';

describe('[api] task create slider', () => {
  test('should retun 400 if config is invalid', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      ...imageSliderTask,
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
    const prefix = 'foo';
    const { request } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskCreate.route, {
      method: taskCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: imageSliderTask,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, imageSliderTask.name);
    assert.equal(body.type, imageSliderTask.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.title, imageSliderTask.config.title);

    for (let i = 0; i < body.config.slides.length; i++) {
      const slide = body.config.slides[i];

      assert.equal(slide.image.id, imageSliderTask.config.slides[i].image.id);
      assert.equal(
        slide.image.filename,
        imageSliderTask.config.slides[i].image.filename,
      );
      assert.equal(
        slide.image.hashsum,
        imageSliderTask.config.slides[i].image.hashsum,
      );
      assert.ok(
        slide.image.path.startsWith('/foo/'),
        'should add prefix to url',
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });
});
