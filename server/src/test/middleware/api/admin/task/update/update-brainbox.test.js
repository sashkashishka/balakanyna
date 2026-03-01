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
import { brainboxTask } from '../../fixtures/task.js';
import { images } from '../../fixtures/image.js';
import { taskImageTable } from '../../../../../../db/schema.js';
import { assertCommonTaskProps } from '../utils.js';

const hash = '88888888';

describe('[api] task update brainbox', () => {
  test('should retun 400 if config is invalid', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [brainboxTask]);
      },
    });

    const payload = {
      ...brainboxTask,
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
        dbTasks = await seedTasks(db, [brainboxTask]);
      },
    });

    const payload = {
      ...brainboxTask,
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
        dbTasks = await seedTasks(db, [brainboxTask]);
      },
    });

    const payload = {
      ...brainboxTask,
      id: dbTasks[0].id,
      type: 'semaphoreText',
      name: 'BrandNewName',
      config: {
        items: [{ front: { id: 2 }, back: { id: 3 } }],
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
            ...brainboxTask,
            hash,
            config: {
              items: [
                { front: { id: dbImages[0].id }, back: { id: dbImages[1].id } },
              ],
            },
          },
        ]);
      },
    });

    const payload = {
      ...brainboxTask,
      id: dbTasks[0].id,
      name: 'BrandNewName',
      config: {
        items: [
          { front: { id: dbImages[2].id }, back: { id: dbImages[3].id } },
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
    assert.equal(body.hash, hash);
    assertCommonTaskProps(body, payload);
    assert.ok(Array.isArray(body.config.items));
    assert.equal(body.config.items.length, 1);
    assert.equal(junctionIds.length, 2);

    for (let i = 0; i < body.config.items.length; i++) {
      const imgIndex = 2 + i * 2;
      const slide = body.config.items[i];
      const img1 = dbImages[imgIndex];
      const img2 = dbImages[imgIndex + 1];

      assert.equal(slide.front.id, img1.id);
      assert.equal(slide.back.id, img2.id);
    }
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
            ...brainboxTask,
            hash,
            config: {
              items: [
                { front: { id: dbImages[0].id }, back: { id: dbImages[1].id } },
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
        items: [
          { front: { id: dbImages[2].id }, back: { id: dbImages[3].id } },
          { front: { id: dbImages[4].id }, back: { id: dbImages[5].id } },
          { front: { id: dbImages[6].id }, back: { id: dbImages[7].id } },
        ],
      },
    };

    assert.equal(
      (await db.select().from(taskImageTable)).length,
      2,
      'should be present only 2 images at the beginning in junction table',
    );

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
    assert.equal(body.hash, hash, 'should preserve hash');
    assertCommonTaskProps(body, payload);
    assert.ok(Array.isArray(body.config.items));
    assert.ok(body.config.items.length, 2);
    assert.equal(
      junctionIds.length,
      6,
      'should remove all previous ids from the table and add new ones',
    );

    for (let i = 0; i < body.config.items.length; i++) {
      const imgIndex = 2 + i * 2;
      const slide = body.config.items[i];
      const img1 = dbImages[imgIndex];
      const img2 = dbImages[imgIndex + 1];

      assert.equal(slide.front.id, img1.id);
      assert.equal(slide.back.id, img2.id);
    }

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
