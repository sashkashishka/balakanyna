import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as linkLabelTask from '../../../../../../middleware/api/admin/link/labelTask/middleware.js';

import {
  seedAdmins,
  seedLabels,
  seedTaskLabels,
  seedTasks,
} from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { label } from '../../fixtures/label.js';
import { imageSliderTask } from '../../fixtures/task.js';

describe('[api] link label task', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
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

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
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

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        labelId: 1,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if label does not exist', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const payload = {
      labelId: 1,
      taskId: 2,
    };

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: `Missing entity: label`,
    });
  });

  test('should return 400 if task does not exist', async (t) => {
    let dbLabels = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
      },
    });

    const payload = {
      labelId: dbLabels[0].id,
      taskId: 2,
    };

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: `Missing entity: task`,
    });
  });

  test('should return 400 if such record already exist', async (t) => {
    let dbLabels = [];
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
        dbTasks = await seedTasks(db, [imageSliderTask]);
        await seedTaskLabels(db, [
          { taskId: dbTasks[0].id, labelId: dbLabels[0].id },
        ]);
      },
    });

    const payload = {
      labelId: dbLabels[0].id,
      taskId: dbTasks[0].id,
    };

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_MANY_TO_MANY_RELATION',
      message: 'Duplicate many to many relation',
    });
  });

  test('should return 200', async (t) => {
    let dbLabels = [];
    let dbTasks = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const payload = {
      labelId: dbLabels[0].id,
      taskId: dbTasks[0].id,
    };

    const resp = await request(linkLabelTask.route, {
      method: linkLabelTask.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.taskId, payload.taskId);
    assert.equal(body.labelId, payload.labelId);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 5);
  });
});
