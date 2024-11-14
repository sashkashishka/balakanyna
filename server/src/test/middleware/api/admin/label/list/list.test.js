import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as labelList from '../../../../../../middleware/api/admin/label/list/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedLabels } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { labels } from '../../fixtures/label.js';

function getEndpoint(baseUrl, { limit, offset, order_by, dir, color, name }) {
  const url = getUrl(labelList.route, baseUrl);

  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);
  url.searchParams.set('order_by', order_by);
  url.searchParams.set('dir', dir);

  if (color) {
    url.searchParams.set('color', color);
  }
  if (name) {
    url.searchParams.set('name', name);
  }

  return url;
}

describe('[api] label list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(labelList.route, {
      method: labelList.method,
      headers: {
        cookie: 'token=123',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 401);
    assert.deepEqual(body, { error: 'UNAUTHORIZED', message: 'Unauthorized' });
  });

  test('should return 400 if search params failed validation', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
    });

    const resp = await request(url, {
      method: labelList.method,
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

  test('should return 200 and paginated result with order_by createdAt and dir asc', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].createdAt) <= new Date(body[i].createdAt));
    }

    // next page
    const url2 = getEndpoint(baseUrl, {
      offset: offset + limit,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp2 = await request(url2, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body2 = await resp2.json();

    assert.equal(resp2.status, 200);
    assert.deepEqual(body2.length, limit);

    assert.ok(
      new Date(body[body.length - 1].createdAt) < new Date(body2[0].createdAt),
      'shoult be in chronological order',
    );
  });

  test('should return 200 and paginated result with order_by createdAt and dir desc', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'desc',
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].createdAt) >= new Date(body[i].createdAt));
    }

    // next page
    const url2 = getEndpoint(baseUrl, {
      offset: offset + limit,
      limit,
      order_by: 'createdAt',
      dir: 'desc',
    });

    const resp2 = await request(url2, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body2 = await resp2.json();

    assert.equal(resp2.status, 200);
    assert.deepEqual(body2.length, limit);

    assert.ok(
      new Date(body[body.length - 1].createdAt) > new Date(body2[0].createdAt),
      'shoult be in chronological order',
    );
  });

  test('should return 200 and with order_by name and dir asc', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'name',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      const prev = body[i - 1].name;
      const next = body[i].name;

      if (prev === next) {
        assert.ok('names equal');
      } else {
        assert.equal(body[i - 1].name.localeCompare(body[i].name), -1);
      }
    }
  });

  test('should return 200 and with order_by name and dir desc', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'name',
      dir: 'desc',
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.equal(body[i - 1].name.localeCompare(body[i].name), 1);
    }
  });

  test('should return 200 and filter by name', async (t) => {
    const offset = 0;
    const limit = labels.length;
    const name = 'B';

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'desc',
      name,
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, 4);

    for (let i = 0; i < body.length; i++) {
      assert.match(body[i].name, new RegExp(name, 'i'));
    }
  });

  test('should return 200 filter color', async (t) => {
    const offset = 0;
    const limit = labels.length;
    const color = 'green';

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedLabels(db, labels);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'desc',
      color,
    });

    const resp = await request(url, {
      method: labelList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.length, 1);

    for (let i = 0; i < body.length; i++) {
      assert.match(body[i].color, new RegExp(color, 'i'));
    }
  });
});
