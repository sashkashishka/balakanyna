import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskGet from '../../../../../../middleware/api/admin/task/get/middleware.js';

import {
  seedAdmins,
  seedImages,
  seedLabels,
  seedTaskImages,
  seedTaskLabels,
  seedTasks,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { imageSliderTask, semaphoreTextTask } from '../../fixtures/task.js';
import { labels } from '../../fixtures/label.js';
import { image, images } from '../../fixtures/image.js';

function getEndpoint(baseUrl, { id }) {
  const url = getUrl(taskGet.route, baseUrl);

  url.searchParams.set('id', id);

  return url;
}

const hash = '8'.repeat(8);

describe('[api] task get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(taskGet.route, {
      method: taskGet.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if search params are missing', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskGet.route, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if search parasm are invalid', async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 'boo' });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test("should return 404 if task doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 1 });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 200 and list of labels', async (t) => {
    let dbTasks = [];
    let dbTaskLabels = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbLabels = await seedLabels(db, labels);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);

        dbTaskLabels = await seedTaskLabels(db, [
          {
            labelId: dbLabels[0].id,
            taskId: dbTasks[0].id,
          },
          {
            labelId: dbLabels[1].id,
            taskId: dbTasks[0].id,
          },
          {
            taskId: dbTasks[0].id,
            labelId: dbLabels[2].id,
          },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, semaphoreTextTask.name);
    assert.equal(body.type, semaphoreTextTask.type);
    assert.deepEqual(body.config, semaphoreTextTask.config);
    assert.equal(body.errors, null);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 3);

    for (let i = 0; i < body.labels.length; i++) {
      assert.equal(body.labels[i].id, dbTaskLabels[i].labelId);
      assert.ok(body.labels[i].name);
      assert.ok(body.labels[i].type);
      assert.ok(body.labels[i].config);
      assert.ok(body.labels[i].createdAt);
      assert.ok(body.labels[i].updatedAt);
      assert.equal(Object.keys(body.labels[i]).length, 6);
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and label with empty err', async (t) => {
    let dbTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...semaphoreTextTask, hash }]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, semaphoreTextTask.name);
    assert.equal(body.type, semaphoreTextTask.type);
    assert.deepEqual(body.config, semaphoreTextTask.config);
    assert.equal(body.errors, null);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and task validation err if saved in db data is invalid', async (t) => {
    let dbTasks = [];

    const invalidConfigTask = {
      ...semaphoreTextTask,
      config: {
        foo: 1,
      },
    };

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [{ ...invalidConfigTask, hash }]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, invalidConfigTask.name);
    assert.equal(body.type, invalidConfigTask.type);
    assert.deepEqual(body.config, invalidConfigTask.config);
    assert.notEqual(body.errors, null);
    assert.ok(body.errors instanceof Object);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and empty image list if image was not found', async (t) => {
    const prefix = 'foo';
    let dbTasks = [];
    let dbImages = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, [image]);
        dbTasks = await seedTasks(db, [
          {
            ...imageSliderTask,
            hash,
            config: {
              slides: [
                { image: { id: dbImages[0].id } },
                { image: { id: 20 } },
              ],
              title: 'Hello',
            },
          },
        ]);

        await seedTaskImages(db, [
          { imageId: dbImages[0].id, taskId: dbImages[0].id },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, imageSliderTask.name);
    assert.equal(body.type, imageSliderTask.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.slides.length, 1);
    assert.equal(body.config.title, imageSliderTask.config.title);

    const slide = body.config.slides[0];

    assert.equal(slide.image.id, dbImages[0].id);
    assert.equal(slide.image.filename, dbImages[0].filename);
    assert.equal(slide.image.hashsum, dbImages[0].hashsum);
    assert.ok(slide.image.path.startsWith('/foo/'), 'should add prefix to url');

    assert.equal(body.errors, null);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and add image prefix if task config includes images', async (t) => {
    const prefix = 'foo';
    let dbTasks = [];
    let dbImages = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
        dbTasks = await seedTasks(db, [
          {
            ...imageSliderTask,
            hash,
            config: {
              slides: [
                { image: { id: dbImages[0].id } },
                { image: { id: dbImages[1].id } },
              ],
              title: 'Hello',
            },
          },
        ]);

        await seedTaskImages(db, [
          { imageId: dbImages[0].id, taskId: dbImages[0].id },
          { imageId: dbImages[1].id, taskId: dbImages[0].id },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, imageSliderTask.name);
    assert.equal(body.type, imageSliderTask.type);
    assert.ok(Array.isArray(body.config.slides));
    assert.equal(body.config.slides.length, 2);

    assert.equal(body.config.title, imageSliderTask.config.title);

    for (let i = 0; i < body.config.slides.length; i++) {
      const slide = body.config.slides[i];

      assert.equal(slide.image.id, dbImages[i].id);
      assert.equal(slide.image.filename, dbImages[i].filename);
      assert.equal(slide.image.hashsum, dbImages[i].hashsum);
      assert.ok(
        slide.image.path.startsWith('/foo/'),
        'should add prefix to url',
      );
    }

    assert.equal(body.errors, null);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });
});
