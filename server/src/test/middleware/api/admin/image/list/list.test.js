import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as imageList from '../../../../../../middleware/api/admin/image/list/middleware.js';

import {
  seedAdmins,
  seedImageLabels,
  seedImages,
  seedLabels,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { images } from '../../fixtures/image.js';
import { labels } from '../../fixtures/label.js';

function getEndpoint(
  baseUrl,
  {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    filename,
    label,
  },
) {
  const url = getUrl(imageList.route, baseUrl);

  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);
  url.searchParams.set('order_by', order_by);
  url.searchParams.set('dir', dir);

  if (min_created_at) {
    url.searchParams.set('min_created_at', min_created_at);
  }
  if (max_created_at) {
    url.searchParams.set('max_created_at', max_created_at);
  }
  if (filename) {
    url.searchParams.set('filename', filename);
  }
  if (label) {
    label.forEach((l) => {
      url.searchParams.append('labels[]', l);
    });
  }

  return url;
}

describe('[api] image list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(imageList.route, {
      method: imageList.method,
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
    const limit = images.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedImages(db, images);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
    });

    const resp = await request(url, {
      method: imageList.method,
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

  test('should return 200 and all images', async (t) => {
    const prefix = 'foo';
    const offset = 0;
    const limit = images.length;
    let dbImageLabels = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: { media: { prefix } },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbImages = await seedImages(db, images);
        const dbLabels = await seedLabels(db, labels);

        dbImageLabels = await seedImageLabels(db, [
          {
            labelId: dbLabels[0].id,
            imageId: dbImages[0].id,
          },
          {
            labelId: dbLabels[1].id,
            imageId: dbImages[0].id,
          },
          {
            labelId: dbLabels[1].id,
            imageId: dbImages[1].id,
          },
          {
            imageId: dbImages[2].id,
            labelId: dbLabels[2].id,
          },
        ]);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: imageList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, images.length);

    for (let i = 1; i < items.length; i++) {
      assert.ok(
        new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
      );
      assert.ok(items[i].path.startsWith('/foo/'), 'should add prefix to url');

      assert.ok(Array.isArray(items[i].labels));

      for (let j = 0; j < items[i].labels.length; j++) {
        assert.ok(
          dbImageLabels.some(
            ({ labelId }) => labelId === items[i].labels[j].id,
          ),
          'label id is from junction table',
        );
        assert.ok(items[i].labels[j].name);
        assert.ok(items[i].labels[j].type);
        assert.ok(items[i].labels[j].config);
        assert.ok(items[i].labels[j].createdAt);
        assert.ok(items[i].labels[j].updatedAt);
        assert.equal(Object.keys(items[i].labels[j]).length, 6);
      }
    }
  });

  test('should return 200 and paginated result', async (t) => {
    const offset = 0;
    const limit = images.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedImages(db, images);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: imageList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, images.length);

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
      method: imageList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body2 = await resp2.json();
    const { items: items2, total: total2 } = body2;

    assert.equal(resp2.status, 200);
    assert.equal(items2.length, limit);
    assert.equal(total2, total);

    assert.ok(
      new Date(items[items.length - 1].createdAt) <
        new Date(items2[0].createdAt),
      'shoult be in chronological order',
    );
  });

  describe('[order_by]', () => {
    test('should return 200 and order_by createdAt and dir asc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by createdAt and dir desc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) >= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir asc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) <= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir desc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) >= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by filename and dir asc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'filename',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(
          items[i - 1].filename.localeCompare(items[i].filename),
          -1,
        );
      }
    });

    test('should return 200 and order_by filename and dir desc', async (t) => {
      const offset = 0;
      const limit = images.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'filename',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, images.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].filename.localeCompare(items[i].filename), 1);
      }
    });
  });

  describe('[filter]', () => {
    test('should return 200 and filter by filename', async (t) => {
      const offset = 0;
      const limit = images.length;
      const filename = '10';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        filename,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 1);
      assert.equal(total, 1);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].filename, new RegExp(filename, 'i'));
      }
    });

    test('should return 200 filter min_created_at', async (t) => {
      const offset = 0;
      const limit = images.length;
      const min_created_at = new Date('2024-11-19').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_created_at,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 3);
      assert.equal(total, 3);

      for (let i = 0; i < items.length; i++) {
        assert.ok(new Date(min_created_at) <= new Date(items[i].createdAt));
      }
    });

    test('should return 200 filter max_created_at', async (t) => {
      const offset = 0;
      const limit = images.length;
      const max_created_at = new Date('2024-11-19').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        max_created_at,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 7);
      assert.equal(total, 7);

      for (let i = 0; i < items.length; i++) {
        assert.ok(new Date(max_created_at) >= new Date(items[i].createdAt));
      }
    });

    test('should return 200 filter min_created_at and max_created_at', async (t) => {
      const offset = 0;
      const limit = images.length;
      const min_created_at = new Date('2024-11-13').toISOString();
      const max_created_at = new Date('2024-11-17').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_created_at,
        max_created_at,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 5);
      assert.equal(total, 5);

      for (let i = 0; i < items.length; i++) {
        assert.ok(new Date(max_created_at) >= new Date(items[i].createdAt));
        assert.ok(new Date(min_created_at) <= new Date(items[i].createdAt));
      }
    });

    test('should return 200 and filter by labels', async (t) => {
      const offset = 0;
      const limit = images.length;
      let dbImageLabels = [];
      let labelsList = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbImages = await seedImages(db, images);
          const dbLabels = await seedLabels(db, labels);

          labelsList = dbLabels.slice(0, 4).map((l) => l.id);

          dbImageLabels = await seedImageLabels(
            db,
            labelsList.map((labelId, i) => ({
              imageId: dbImages[i].id,
              labelId,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        label: labelsList,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, labelsList.length);
      assert.equal(total, labelsList.length);

      for (let i = 0; i < items.length; i++) {
        assert.equal(items[i].id, dbImageLabels[i].imageId);
      }
    });

    test('should return 200 and total should not be limited to limit param', async (t) => {
      const offset = 0;
      const limit = 2;
      const filename = 'image';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedImages(db, images);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        filename,
      });

      const resp = await request(url, {
        method: imageList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 2);
      assert.equal(total, 10);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].filename, new RegExp(filename, 'i'));
      }
    });
  });
});
