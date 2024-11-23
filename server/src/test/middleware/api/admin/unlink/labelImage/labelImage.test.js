import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as unlinkLabelImage from '../../../../../../middleware/api/admin/unlink/labelImage/middleware.js';

import {
  seedAdmins,
  seedLabels,
  seedImageLabels,
  seedImages,
} from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { label } from '../../fixtures/label.js';
import { image } from '../../fixtures/image.js';

describe('[api] unlink label image', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
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

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
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

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
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
      imageId: 2,
    };

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: 'Missing entity: label',
    });
  });

  test('should return 400 if image does not exist', async (t) => {
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
      imageId: 2,
    };

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'MISSING_ENTITY',
      message: 'Missing entity: image',
    });
  });

  test('should return 200 if record does not exist', async (t) => {
    let dbLabels = [];
    let dbImages = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
        dbImages = await seedImages(db, [image]);
      },
    });

    const payload = {
      labelId: dbLabels[0].id,
      imageId: dbImages[0].id,
    };

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, { ok: true });
  });

  test('should return 200', async (t) => {
    let dbLabels = [];
    let dbImages = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
        dbImages = await seedImages(db, [image]);
        await seedImageLabels(db, [
          { imageId: dbImages[0].id, labelId: dbLabels[0].id },
        ]);
      },
    });

    const payload = {
      labelId: dbLabels[0].id,
      imageId: dbImages[0].id,
    };

    const resp = await request(unlinkLabelImage.route, {
      method: unlinkLabelImage.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, { ok: true });
  });
});