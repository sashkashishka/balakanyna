import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as labelCreate from '../../../../../../middleware/api/admin/label/create/middleware.js';

import { seedAdmins, seedLabels } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { label } from '../../fixtures/label.js';

describe('[api] label create', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
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

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
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

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Image 1',
        type: 'image',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if duplicate label both name and type', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, [label]);
      },
    });

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: label,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DUPLICATE_LABEL',
      message: 'Duplicate label',
    });
  });

  test('should return 200 and create label with duplicate name but different type', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, [label]);
      },
    });

    const payload = {
      ...label,
      type: 'image',
    };

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, payload.name);
    assert.equal(body.name_normalized, payload.name.toLowerCase());
    assert.equal(body.type, payload.type);
    assert.deepEqual(body.config, payload.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });

  test('should return 200 and create label', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(labelCreate.route, {
      method: labelCreate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: label,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.name, label.name);
    assert.equal(body.name_normalized, label.name.toLowerCase());
    assert.equal(body.type, label.type);
    assert.deepEqual(body.config, label.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });
});
