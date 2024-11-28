import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';

describe('[api] task update slider', () => {
  test('should retun 400 if config is invalid', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      ...imageSliderTask,
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
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      ...imageSliderTask,
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'BrandNewName',
      config: {
        title: 'BrandNewTitle',
        slides: [
          {
            image: {
              id: 2,
              hashsum: 'bbb',
              filename: 'baz.png',
              path: 'bbb.png',
            },
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
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      ...imageSliderTask,
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

  test('should return 200 and update task', async (t) => {
    const prefix = 'foo';
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      ...imageSliderTask,
      id: dbTasks[0].id,
      name: 'BrandNewName',
      config: {
        title: 'BrandNewTitle',
        slides: [
          {
            image: {
              id: 2,
              hashsum: 'bbb',
              filename: 'baz.png',
              path: 'bbb.png',
            },
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

    assert.equal(resp.status, 200);
    assert.equal(body.id, payload.id);
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.title, payload.config.title);

    for (let i = 0; i < body.config.slides.length; i++) {
      const slide = body.config.slides[i];

      assert.equal(slide.image.id, payload.config.slides[i].image.id);
      assert.equal(
        slide.image.filename,
        payload.config.slides[i].image.filename,
      );
      assert.equal(slide.image.hashsum, payload.config.slides[i].image.hashsum);
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
