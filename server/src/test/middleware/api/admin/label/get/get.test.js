import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getUrl } from '../../../../../../utils/network.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as labelGet from '../../../../../../middleware/api/admin/label/get/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedLabels } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { label } from '../../fixtures/label.js';

function getEndpoint(baseUrl, { id }) {
  const url = getUrl(labelGet.route, baseUrl);

  url.searchParams.set('id', id);

  return url;
}

describe('[api] label get', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(labelGet.route, {
      method: labelGet.method,
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

    const resp = await request(labelGet.route, {
      method: labelGet.method,
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
      method: labelGet.method,
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

  test("should return 404 if label doesn't exist", async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 300 });

    const resp = await request(endpoint, {
      method: labelGet.method,
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

  test('should return 200 and existing label', async (t) => {
    let dbLabels = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbLabels[0].id });

    const resp = await request(endpoint, {
      method: labelGet.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, label.name);
    assert.equal(body.type, label.type);
    assert.deepEqual(body.config, label.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 6);
  });
});
