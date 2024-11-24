import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as imageGet from '../../../../../../middleware/api/admin/image/get/middleware.js';

import {
  seedAdmins,
  seedImageLabels,
  seedImages,
  seedLabels,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { images } from '../../fixtures/image.js';
import { labels } from '../../fixtures/label.js';

function getEndpoint(baseUrl, { id }) {
  const url = getUrl(imageGet.route, baseUrl);

  url.searchParams.set('id', id);

  return url;
}

describe('[api] image get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(imageGet.route, {
      method: imageGet.method,
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

    const resp = await request(imageGet.route, {
      method: imageGet.method,
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
      method: imageGet.method,
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

  test("should return 404 if image doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 1 });

    const resp = await request(endpoint, {
      method: imageGet.method,
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

  test('should return 200', async (t) => {
    let dbImages = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbImages[0].id });

    const resp = await request(endpoint, {
      method: imageGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbImages[0].id);
    assert.equal(body.filename, dbImages[0].filename);
    assert.equal(body.hashsum, dbImages[0].hashsum);
    // TODO: add check for prefix
    assert.equal(body.path, dbImages[0].path);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });

  test('should return 200 and list of task ids', async (t) => {
    let dbImages = [];
    let dbLabels = [];
    let dbLabelImages = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbImages = await seedImages(db, images);
        dbLabels = await seedLabels(db, labels);

        dbLabelImages = await seedImageLabels(db, [
          {
            labelId: dbLabels[0].id,
            imageId: dbImages[0].id,
          },
          {
            labelId: dbLabels[1].id,
            imageId: dbImages[0].id,
          },
          {
            labelId: dbLabels[2].id,
            imageId: dbImages[0].id,
          },
          {
            labelId: dbLabels[2].id,
            imageId: dbImages[1].id,
          },
          {
            labelId: dbLabels[2].id,
            imageId: dbImages[2].id,
          },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbImages[0].id });

    const resp = await request(endpoint, {
      method: imageGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.id, dbImages[0].id);
    assert.equal(body.filename, dbImages[0].filename);
    assert.equal(body.hashsum, dbImages[0].hashsum);
    // TODO: add check for prefix
    assert.equal(body.path, dbImages[0].path);
    assert.ok(Array.isArray(body.labels));
    assert.equal(body.labels.length, 3);

    for (let i = 0; i < body.labels.length; i++) {
      assert.equal(body.labels[i].id, dbLabelImages[i].labelId);
      assert.ok(body.labels[i].name);
      assert.ok(body.labels[i].type);
      assert.ok(body.labels[i].config);
      assert.ok(body.labels[i].createdAt);
      assert.ok(body.labels[i].updatedAt);
      assert.equal(Object.keys(body.labels[i]).length, 6);
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });
});
