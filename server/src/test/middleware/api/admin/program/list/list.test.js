import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as programList from '../../../../../../middleware/api/admin/program/list/middleware.js';

import {
  seedAdmins,
  seedTasks,
  seedLabels,
  seedTaskLabels,
  seedUsers,
  seedPrograms,
  seedProgramTask,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { imageSliderTask, tasks } from '../../fixtures/task.js';
import { labels } from '../../fixtures/label.js';
import { getProgram, programs } from '../../fixtures/program.js';
import { user, users } from '../../fixtures/user.js';

function getEndpoint(
  baseUrl,
  {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    min_updated_at,
    max_updated_at,
    min_start_datetime,
    max_start_datetime,
    min_expiration_datetime,
    max_expiration_datetime,
    ids,
    userIds,
    name,
  },
) {
  const url = getUrl(programList.route, baseUrl);

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
  if (min_updated_at) {
    url.searchParams.set('min_updated_at', min_updated_at);
  }
  if (max_updated_at) {
    url.searchParams.set('max_updated_at', max_updated_at);
  }
  if (min_start_datetime) {
    url.searchParams.set('min_start_datetime', min_start_datetime);
  }
  if (max_start_datetime) {
    url.searchParams.set('max_start_datetime', max_start_datetime);
  }
  if (min_expiration_datetime) {
    url.searchParams.set('min_expiration_datetime', min_expiration_datetime);
  }
  if (max_expiration_datetime) {
    url.searchParams.set('max_expiration_datetime', max_expiration_datetime);
  }
  if (name) {
    url.searchParams.set('name', name);
  }
  if (ids) {
    ids.forEach((id) => {
      url.searchParams.append('ids[]', id);
    });
  }
  if (userIds) {
    userIds.forEach((u) => {
      url.searchParams.append('userIds[]', u);
    });
  }

  return url;
}

describe('[api] program list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(programList.route, {
      method: programList.method,
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
    const limit = users.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, users);
        await seedPrograms(
          db,
          dbUsers.map(({ id }) => getProgram({ userId: id })),
        );
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
    });

    const resp = await request(url, {
      method: programList.method,
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

  test('should return 400 if limits are out of range', async (t) => {
    const offset = 0;
    const limit = 1000;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, users);
        await seedPrograms(
          db,
          dbUsers.map(({ id }) => getProgram({ userId: id })),
        );
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: programList.method,
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

  test('should return 200 and all programs', async (t) => {
    const offset = 0;
    const limit = users.length;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, users);
        await seedPrograms(
          db,
          dbUsers.map(({ id }, i) => ({
            ...programs[i],
            userId: id,
          })),
        );
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: programList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, limit);

    for (let i = 1; i < items.length; i++) {
      assert.ok(
        new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
      );
    }
  });

  test('should return 200 and paginated result', async (t) => {
    const offset = 0;
    const limit = users.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, users);
        await seedPrograms(
          db,
          dbUsers.map(({ id }, i) => ({
            ...programs[i],
            userId: id,
          })),
        );
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: programList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, users.length);

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
      method: programList.method,
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
      'shoult be in chronological order',
    );
  });

  describe('[order_by]', () => {
    test('should return 200 and order_by createdAt and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by createdAt and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) >= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) <= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) >= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by startDatetime and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'startDatetime',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].startDatetime) <=
            new Date(items[i].startDatetime),
        );
      }
    });

    test('should return 200 and order_by startDatetime and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'startDatetime',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].startDatetime) >=
            new Date(items[i].startDatetime),
        );
      }
    });

    test('should return 200 and order_by expirationDatetime and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'expirationDatetime',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].expirationDatetime) <=
            new Date(items[i].expirationDatetime),
        );
      }
    });

    test('should return 200 and order_by expirationDatetime and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'expirationDatetime',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].expirationDatetime) >=
            new Date(items[i].expirationDatetime),
        );
      }
    });

    test('should return 200 and order_by name and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].name.localeCompare(items[i].name), -1);
      }
    });

    test('should return 200 and order_by name and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].name.localeCompare(items[i].name), 1);
      }
    });
  });

  describe('[filter]', () => {
    test('should return 200 and filter by name', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const name = 'd';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
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
        method: programList.method,
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
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });

    test('should return 200 filter min_created_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_created_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
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
        method: programList.method,
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
      const limit = tasks.length;
      const max_created_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
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
        method: programList.method,
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
        assert.ok(new Date(max_created_at) >= new Date(items[i].createdAt));
      }
    });

    test('should return 200 filter min_created_at and max_created_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_created_at = new Date('2023-03-01').toISOString();
      const max_created_at = new Date('2023-03-31').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
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
        method: programList.method,
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
        assert.ok(new Date(max_created_at) >= new Date(items[i].createdAt));
        assert.ok(new Date(min_created_at) <= new Date(items[i].createdAt));
      }
    });

    test('should return 200 filter min_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_updated_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_updated_at,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(min_updated_at) <= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 filter max_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const max_updated_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        max_updated_at,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_updated_at) >= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 filter min_updated_at and max_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_updated_at = new Date('2023-03-01').toISOString();
      const max_updated_at = new Date('2023-03-31').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_updated_at,
        max_updated_at,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_updated_at) >= new Date(items[i].updatedAt));
        assert.ok(new Date(min_updated_at) <= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 filter min_start_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_start_datetime = new Date('2023-03-21').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_start_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(min_start_datetime) <= new Date(items[i].startDatetime));
      }
    });

    test('should return 200 filter max_start_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const max_start_datetime = new Date('2023-03-21').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        max_start_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_start_datetime) >= new Date(items[i].startDatetime));
      }
    });

    test('should return 200 filter min_start_datetime and max_start_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_start_datetime = new Date('2023-01-01').toISOString();
      const max_start_datetime = new Date('2023-03-31').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_start_datetime,
        max_start_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_start_datetime) >= new Date(items[i].startDatetime));
        assert.ok(new Date(min_start_datetime) <= new Date(items[i].startDatetime));
      }
    });

    test('should return 200 filter min_expiration_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_expiration_datetime = new Date('2023-03-28').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_expiration_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(min_expiration_datetime) <= new Date(items[i].expirationDatetime));
      }
    });

    test('should return 200 filter max_expiration_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const max_expiration_datetime = new Date('2023-03-28').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        max_expiration_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_expiration_datetime) >= new Date(items[i].expirationDatetime));
      }
    });

    test('should return 200 filter min_expiration_datetime and max_expiration_datetime', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_expiration_datetime = new Date('2023-01-01').toISOString();
      const max_expiration_datetime = new Date('2023-03-31').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
        min_expiration_datetime,
        max_expiration_datetime,
      });

      const resp = await request(url, {
        method: programList.method,
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
        assert.ok(new Date(max_expiration_datetime) >= new Date(items[i].expirationDatetime));
        assert.ok(new Date(min_expiration_datetime) <= new Date(items[i].expirationDatetime));
      }
    });

    test('should return 200 and filter by ids', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbPrograms = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          dbPrograms = await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const ids = dbPrograms.slice(0, 4).map(({ id}) => id)

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        ids,
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, ids.length);
      assert.equal(total, ids.length);

      for (let i = 0; i < items.length; i++) {
        assert.ok(ids.includes(items[i].id));
      }
    });

    test('should return 200 and filter by userIds', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbUsers = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
        },
      });

      const userIds = dbUsers.slice(0, 4).map(({ id}) => id)

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        userIds,
      });

      const resp = await request(url, {
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, userIds.length);
      assert.equal(total, userIds.length);

      for (let i = 0; i < items.length; i++) {
        assert.ok(userIds.includes(items[i].userId));
      }
    });


    test('should return 200 and total should not be limited to limit param', async (t) => {
      const offset = 0;
      const limit = 2;
      const name = 'Program';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          await seedPrograms(
            db,
            dbUsers.map(({ id }, i) => ({
              ...programs[i],
              userId: id,
            })),
          );
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
        method: programList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, users.length);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });
  });
});
