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

function getEndpoint(baseUrl, { limit, offset, order_by, dir, name, type }) {
  const url = getUrl(labelList.route, baseUrl);

  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);
  url.searchParams.set('order_by', order_by);
  url.searchParams.set('dir', dir);

  if (name) {
    url.searchParams.set('name', name);
  }
  if (type) {
    url.searchParams.set('type', type);
  }

  return url;
}

describe('[api] label list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
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

  test('should return 200 and all labels', async (t) => {
    const offset = 0;
    const limit = labels.length;

    const { request, baseUrl } = await getTestServer({
      t,
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
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, labels.length);

    for (let i = 1; i < items.length; i++) {
      assert.ok(
        new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
      );
    }
  });

  test('should return 200 and paginated', async (t) => {
    const offset = 0;
    const limit = labels.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
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
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, labels.length);

    for (let i = 1; i < items.length; i++) {
      assert.ok(
        new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
      );
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
    const { items: items2, total: total2 } = body2;

    assert.equal(resp2.status, 200);
    assert.deepEqual(items2.length, limit);
    assert.equal(total2, total);

    assert.ok(
      new Date(items[items.length - 1].createdAt) <
        new Date(items2[0].createdAt),
      'should be in chronological order',
    );
  });

  describe('[order_by]', () => {
    test('should return 200 and order_by createdAt and dir asc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by createdAt and dir desc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) >= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir asc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedLabels(db, labels);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: labelList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) <= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir desc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedLabels(db, labels);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: labelList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) >= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and with order_by name and dir asc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1].name;
        const next = items[i].name;

        if (prev === next) {
          assert.ok('names equal');
        } else {
          assert.equal(items[i - 1].name.localeCompare(items[i].name), -1);
        }
      }
    });

    test('should return 200 and with order_by name and dir desc', async (t) => {
      const offset = 0;
      const limit = labels.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, labels.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].name.localeCompare(items[i].name), 1);
      }
    });
  });

  describe('[filter]', () => {
    test('should return 200 and filter by name', async (t) => {
      const offset = 0;
      const limit = labels.length;
      const name = 'B';

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 4);
      assert.equal(total, 4);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });

    test('should return 200 and filter by type', async (t) => {
      const offset = 0;
      const limit = labels.length;
      const type = 'task';

      const { request, baseUrl } = await getTestServer({
        t,
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
        type,
      });

      const resp = await request(url, {
        method: labelList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 2);
      assert.equal(total, 2);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].type, new RegExp(type, 'i'));
      }
    });


    test('should return 200 and total should not be limited to limit param', async (t) => {
      const offset = 0;
      const limit = 2;
      const name = 'B';

      const { request, baseUrl } = await getTestServer({
        t,
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
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 2);
      assert.equal(total, 4);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });
  });
});
