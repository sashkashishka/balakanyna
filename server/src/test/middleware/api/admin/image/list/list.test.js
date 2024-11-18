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
    const offset = 0;
    const limit = images.length;

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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].createdAt) <= new Date(body[i].createdAt));
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
      method: imageList.method,
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].createdAt) <= new Date(body[i].createdAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].createdAt) >= new Date(body[i].createdAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].updatedAt) <= new Date(body[i].updatedAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.ok(new Date(body[i - 1].updatedAt) >= new Date(body[i].updatedAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.equal(body[i - 1].filename.localeCompare(body[i].filename), -1);
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, limit);

    for (let i = 1; i < body.length; i++) {
      assert.equal(body[i - 1].filename.localeCompare(body[i].filename), 1);
    }
  });

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

    assert.equal(resp.status, 200);
    assert.equal(body.length, 1);

    for (let i = 0; i < body.length; i++) {
      assert.match(body[i].filename, new RegExp(filename, 'i'));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, 3);

    for (let i = 0; i < body.length; i++) {
      assert.ok(new Date(min_created_at) <= new Date(body[i].createdAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, 7);

    for (let i = 0; i < body.length; i++) {
      assert.ok(new Date(max_created_at) >= new Date(body[i].createdAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, 5);

    for (let i = 0; i < body.length; i++) {
      assert.ok(new Date(max_created_at) >= new Date(body[i].createdAt));
      assert.ok(new Date(min_created_at) <= new Date(body[i].createdAt));
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

    assert.equal(resp.status, 200);
    assert.equal(body.length, labelsList.length);

    for (let i = 0; i < body.length; i++) {
      assert.equal(body[i].id, dbImageLabels[i].imageId);
    }
  });
});
