import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';

import * as taskGet from '../../../../../../middleware/api/client/task/get/middleware.js';

import {
  seedPrograms,
  seedTasks,
  seedImages,
  seedUsers,
  seedTaskImages,
} from '../../../../../../db/seeders.js';

import { user } from '../../../admin/fixtures/user.js';
import { getProgram } from '../../../admin/fixtures/program.js';
import { brainboxTask, imageSliderTask } from '../../../admin/fixtures/task.js';
import { image, images } from '../../../admin/fixtures/image.js';

function getEndpoint(baseUrl, params) {
  const url = getUrl(taskGet.route, baseUrl);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  return url;
}

const hash = '0'.repeat(8);

describe('[api] client task get', async () => {
  test('should return 400 if search params are missing', async (t) => {
    const { request } = await getTestServer({ t });

    const resp = await request(taskGet.route, {
      method: taskGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if search params are invalid', async (t) => {
    const { request, baseUrl } = await getTestServer({ t });

    const endpoint = getEndpoint(baseUrl, { foo: 1 });

    const resp = await request(endpoint, {
      method: taskGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test("should return 404 if task doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({ t });

    const endpoint = getEndpoint(baseUrl, { id: '12345678' });

    const resp = await request(endpoint, {
      method: taskGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 404 if pass real task id to search params', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db) {
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({
            hash,
            userId: dbUsers[0].id,
          }),
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbPrograms[0].id });

    const resp = await request(endpoint, {
      method: taskGet.method,
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  describe('image fields', () => {
    describe('imageSliderTask', () => {
      test('should return 200 and empty image list if image was not found', async (t) => {
        const prefix = 'foo';
        let dbTasks = [];
        let dbImages = [];

        const { request, baseUrl } = await getTestServer({
          t,
          config: { media: { prefix } },
          async seed(db) {
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

        const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].hash });

        const resp = await request(endpoint, {
          method: taskGet.method,
        });
        const body = await resp.json();

        assert.equal(resp.status, 200);
        assert.equal(body.id.length, 8);
        assert.equal(body.type, imageSliderTask.type);
        assert.ok(Array.isArray(body.config.slides));
        assert.equal(body.config.slides.length, 1);
        assert.equal(body.config.title, imageSliderTask.config.title);

        const slide = body.config.slides[0];

        assert.ok(slide.image.id);
        assert.ok(
          slide.image.path.startsWith('/foo/'),
          'should add prefix to url',
        );
        assert.equal(Object.keys(slide.image).length, 2);

        assert.equal(Object.keys(body).length, 3);
      });

      test('should return 200 and add image prefix if task config includes images', async (t) => {
        const prefix = 'foo';
        let dbTasks = [];
        let dbImages = [];

        const { request, baseUrl } = await getTestServer({
          t,
          config: { media: { prefix } },
          async seed(db) {
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

        const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].hash });

        const resp = await request(endpoint, {
          method: taskGet.method,
        });
        const body = await resp.json();

        assert.equal(resp.status, 200);
        assert.equal(body.id.length, 8);
        assert.equal(body.type, imageSliderTask.type);
        assert.ok(Array.isArray(body.config.slides));
        assert.equal(body.config.slides.length, 2);

        assert.equal(body.config.title, imageSliderTask.config.title);

        for (let i = 0; i < body.config.slides.length; i++) {
          const slide = body.config.slides[i];

          assert.equal(slide.image.id, dbImages[i].id);
          assert.ok(
            slide.image.path.startsWith('/foo/'),
            'should add prefix to url',
          );
        }

        assert.equal(Object.keys(body).length, 3);
      });
    });

    describe('brainbox task', () => {
      test('should return 200 and empty image object if image was not found', async (t) => {
        const prefix = 'foo';
        let dbTasks = [];
        let dbImages = [];

        const { request, baseUrl } = await getTestServer({
          t,
          config: { media: { prefix } },
          async seed(db) {
            dbImages = await seedImages(db, [image]);
            dbTasks = await seedTasks(db, [
              {
                ...brainboxTask,
                hash,
                config: {
                  items: [
                    { front: { id: dbImages[0].id }, back: { id: 1000 } },
                  ],
                },
              },
            ]);

            await seedTaskImages(db, [
              { imageId: dbImages[0].id, taskId: dbImages[0].id },
            ]);
          },
        });

        const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].hash });

        const resp = await request(endpoint, {
          method: taskGet.method,
        });
        const body = await resp.json();

        assert.equal(resp.status, 200);
        assert.equal(body.id.length, 8);
        assert.equal(body.type, brainboxTask.type);
        assert.ok(Array.isArray(body.config.items));
        assert.equal(body.config.items.length, 1);

        const slide = body.config.items[0];

        assert.ok(slide.front.id);
        assert.deepEqual(slide.back, {});
        assert.ok(
          slide.front.path.startsWith('/foo/'),
          'should add prefix to url',
        );
        assert.equal(Object.keys(slide.front).length, 2);
        assert.equal(Object.keys(slide.back).length, 0);

        assert.equal(Object.keys(body).length, 3);
      });

      test('should return 200 and add image prefix if task config includes images', async (t) => {
        const prefix = 'foo';
        let dbTasks = [];
        let dbImages = [];

        const { request, baseUrl } = await getTestServer({
          t,
          config: { media: { prefix } },
          async seed(db) {
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
              { imageId: dbImages[0].id, taskId: dbImages[0].id },
              { imageId: dbImages[1].id, taskId: dbImages[0].id },
            ]);
          },
        });

        const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].hash });

        const resp = await request(endpoint, {
          method: taskGet.method,
        });
        const body = await resp.json();

        assert.equal(resp.status, 200);
        assert.equal(body.id.length, 8);
        assert.equal(body.type, brainboxTask.type);
        assert.ok(Array.isArray(body.config.items));
        assert.equal(body.config.items.length, 1);

        for (let i = 0; i < body.config.items.length; i++) {
          const slide = body.config.items[i];

          assert.equal(slide.front.id, dbImages[i].id);
          assert.equal(slide.back.id, dbImages[i + 1].id);
          assert.ok(
            slide.front.path.startsWith('/foo/'),
            'should add prefix to url',
          );
          assert.ok(
            slide.back.path.startsWith('/foo/'),
            'should add prefix to url',
          );
        }

        assert.equal(Object.keys(body).length, 3);
      });
    });
  });
});
