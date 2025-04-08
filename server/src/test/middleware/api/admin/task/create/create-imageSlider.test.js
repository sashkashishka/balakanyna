import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';

import { seedAdmins, seedImages } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';
import { images } from '../../fixtures/image.js';
import { taskImageTable } from '../../../../../../db/schema.js';

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
    let dbImages = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
      },
    });

    const payload = {
      ...imageSliderTask,
      config: {
        title: 'Hi',
        slides: [
          { image: { id: dbImages[0].id } },
          { image: { id: dbImages[1].id } },
        ],
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
    const junctionIds = await db.select().from(taskImageTable);

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.title, payload.config.title);
    assert.equal(junctionIds.length, payload.config.slides.length);

    for (let i = 0; i < body.config.slides.length; i++) {
      const slide = body.config.slides[i];

      assert.notEqual(
        junctionIds.findIndex((item) => item.imageId === slide.image.id),
        -1,
      );
      assert.notEqual(
        junctionIds.findIndex((item) => item.taskId === body.id),
        -1,
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });
});
