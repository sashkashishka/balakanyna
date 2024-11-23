import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as taskUpdate from '../../../../../../middleware/api/admin/task/update/middleware.js';

import { seedAdmins, seedTasks } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';

describe('[api] task update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if body is missing', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
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

  test('should return 400 if body is not full', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Task2',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if task does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 300,
        ...imageSliderTask,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 400 if config already exists', async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        ...imageSliderTask,
        id: dbTasks[0].id,
        name: 'Task New',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[0].id}`,
    });
  });

  test("should return 400 if passed config's keys unsorted", async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        ...imageSliderTask,
        id: dbTasks[0].id,
        name: 'Task New',
        config: {
          slides: [
            {
              image: {
                hashsum: 'aaa',
                filename: 'foo.jpeg',
                path: 'aaa.jpeg',
                id: 1,
              },
            },
          ],
          title: 'Hello',
        },
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_TASK',
      message: `${dbTasks[0].id}`,
    });
  });

  test("should sort config's keys before saving to the db", async (t) => {
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const resp = await request(taskUpdate.route, {
      method: taskUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        ...imageSliderTask,
        id: dbTasks[0].id,
        name: 'Task New',
        config: {
          slides: [
            {
              image: {
                hashsum: 'bbb',
                filename: 'foo.jpeg',
                path: 'bbb.jpeg',
                id: 1,
              },
            },
          ],
          title: 'Hello',
        },
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(
      JSON.stringify(body.config),
      '{"slides":[{"image":{"filename":"foo.jpeg","hashsum":"bbb","id":1,"path":"bbb.jpeg"}}],"title":"Hello"}',
    );
  });
  test('should return 200 and update task', async (t) => {
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
    assert.equal(body.id, dbTasks[0].id);
    assert.equal(body.name, payload.name);
    assert.equal(body.type, payload.type);
    assert.deepEqual(body.config, payload.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);

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
