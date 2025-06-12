import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie, sleep } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import {
  seedAdmins,
  seedImages,
  seedTaskImages,
  seedTasks,
} from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';
import { images } from '../../fixtures/image.js';
import { taskImageTable } from '../../../../../../db/schema.js';

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
    let dbImages = [];

    const { request, db } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
        dbTasks = await seedTasks(db, [
          {
            ...imageSliderTask,
            config: {
              ...imageSliderTask.config,
              slides: [
                { image: { id: dbImages[0].id } },
                { image: { id: dbImages[1].id } },
              ],
            },
          },
        ]);
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
              id: dbImages[2].id,
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
    const junctionIds = await db.select().from(taskImageTable);

    assert.equal(resp.status, 200);
    assert.equal(body.id, payload.id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.slides.length, 1);
    assert.equal(junctionIds.length, 1);
    assert.equal(body.config.title, payload.config.title);

    for (let i = 0; i < body.config.slides.length; i++) {
      const imgIndex = 2 + i;
      const slide = body.config.slides[i];
      const img = dbImages[imgIndex];

      assert.equal(slide.image.id, img.id);
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });

  test('should return 200 if provide repetetive images in config', async (t) => {
    let dbTasks = [];
    let dbImages = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
        dbTasks = await seedTasks(db, [
          {
            ...imageSliderTask,
            config: {
              ...imageSliderTask.config,
              slides: [
                { image: { id: dbImages[0].id } },
                { image: { id: dbImages[1].id } },
              ],
            },
          },
        ]);

        await seedTaskImages(db, [
          { taskId: dbTasks[0].id, imageId: dbImages[0].id },
          { taskId: dbTasks[0].id, imageId: dbImages[1].id },
        ]);
      },
    });

    const payload = {
      id: dbTasks[0].id,
      type: dbTasks[0].type,
      name: 'New Task',
      config: {
        title: 'new title',
        slides: [
          { image: { id: dbImages[2].id } },
          { image: { id: dbImages[2].id } },
          { image: { id: dbImages[2].id } },
        ],
      },
    };

    await sleep(1000);

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const junctionIds = await db.select().from(taskImageTable);

    assert.equal(resp.status, 200);
    assert.equal(body.id, payload.id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.name, payload.name);
    assert.ok(Array.isArray(body.config.slides));
    assert.ok(body.config.slides.length, 3);
    assert.equal(body.config.title, payload.config.title);
    assert.equal(
      junctionIds.length,
      1,
      'should remove all previous ids from the table',
    );

    for (let i = 0; i < body.config.slides.length; i++) {
      const imgIndex = 2;
      const slide = body.config.slides[i];
      const img = dbImages[imgIndex];

      assert.equal(slide.image.id, img.id);
      assert.equal(slide.image.id, junctionIds[0].imageId);
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);

    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbTasks[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbTasks[0].createdAt).getTime(),
    );
  });
});
