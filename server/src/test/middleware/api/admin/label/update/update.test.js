import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as labelUpdate from '../../../../../../middleware/api/admin/label/update/middleware.js';

import { seedAdmins, seedLabels } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { label, labels } from '../../fixtures/label.js';

describe('[api] label update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
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

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
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

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Image 1',
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

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 1,
        ...label,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'LABEL_DOES_NOT_EXIST',
      message: 'Label does not exist',
    });
  });

  test('should return 400 and if name exists in other label within the same type', async (t) => {
    let dbLabels = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, labels);
      },
    });

    const payload = {
      id: dbLabels[0].id,
      name: 'Bar',
      config: {
        color: 'red',
        bordered: false,
      },
      type: 'image',
    };

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'LABEL_WITH_SUCH_NAME_EXISTS',
      message: 'Label with such name exists',
    });
  });

  test("should return 200 and update label's name and config", async (t) => {
    let dbLabels = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbLabels = await seedLabels(db, [label]);
      },
    });

    const payload = {
      id: dbLabels[0].id,
      name: 'Bar',
      config: {
        color: 'red',
        bordered: false,
      },
      type: 'image',
    };

    const resp = await request(labelUpdate.route, {
      method: labelUpdate.method,
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
    assert.equal(body.type, label.type, 'should remain unchanged');
    assert.deepEqual(body.config, payload.config);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 7);
  });
});
