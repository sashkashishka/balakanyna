import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as userList from '../../../../../../middleware/api/admin/user/list/middleware.js';

import { seedAdmins } from '../../../../../../db/seeders.js';
import { seedUsers } from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { users } from '../../fixtures/user.js';

function getEndpoint(
  baseUrl,
  {
    limit,
    offset,
    order_by,
    dir,
    min_created_at,
    max_created_at,
    min_birthdate,
    max_birthdate,
    min_grade,
    max_grade,
    name,
    surname,
  },
) {
  const url = getUrl(userList.route, baseUrl);

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
  if (min_birthdate) {
    url.searchParams.set('min_birthdate', min_birthdate);
  }
  if (max_birthdate) {
    url.searchParams.set('max_birthdate', max_birthdate);
  }
  if (min_grade !== undefined) {
    url.searchParams.set('min_grade', min_grade);
  }
  if (max_grade !== undefined) {
    url.searchParams.set('max_grade', max_grade);
  }
  if (surname) {
    url.searchParams.set('surname', surname);
  }
  if (name) {
    url.searchParams.set('name', name);
  }

  return url;
}

describe('[api] user list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(userList.route, {
      method: userList.method,
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
        await seedUsers(db, users);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
    });

    const resp = await request(url, {
      method: userList.method,
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

  test('should return 200 and paginated result', async (t) => {
    const offset = 0;
    const limit = users.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedUsers(db, users);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: userList.method,
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
      method: userList.method,
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
    test('should return 200 and with order_by createdAt and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by createdAt and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by updatedAt and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by updatedAt and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by name and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by name and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: userList.method,
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

    test('should return 200 and with order_by grade and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'grade',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(items[i - 1].grade <= items[i].grade);
      }
    });

    test('should return 200 and with order_by grade and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'grade',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(items[i - 1].grade >= items[i].grade);
      }
    });

    test('should return 200 and with order_by birthdate and dir asc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'birthdate',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: userList.method,
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
          new Date(items[i - 1].birthdate) <= new Date(items[i].birthdate),
        );
      }
    });

    test('should return 200 and with order_by birthdate and dir desc', async (t) => {
      const offset = 0;
      const limit = users.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'birthdate',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: userList.method,
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
          new Date(items[i - 1].birthdate) >= new Date(items[i].birthdate),
        );
      }
    });
  });

  describe('[filter]', () => {
    test('should return 200 and filter by name', async (t) => {
      const offset = 0;
      const limit = users.length;
      const name = 'd';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
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
        method: userList.method,
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

    test('should return 200 and filter by surname', async (t) => {
      const offset = 0;
      const limit = 2;
      const surname = 'i';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        surname,
      });

      const resp = await request(url, {
        method: userList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, 2);
      assert.equal(total, 3);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].surname, new RegExp(surname, 'i'));
      }
    });

    test('should return 200 filter min_created_at', async (t) => {
      const offset = 0;
      const limit = users.length;
      const min_created_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
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
        method: userList.method,
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
      const limit = users.length;
      const max_created_at = new Date('2023-03-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
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
        method: userList.method,
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
      const limit = users.length;
      const min_created_at = new Date('2023-03-01').toISOString();
      const max_created_at = new Date('2023-03-31').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
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
        method: userList.method,
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

    test('should return 200 filter min_grade', async (t) => {
      const offset = 0;
      const limit = users.length;
      const min_grade = 8;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_grade,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(min_grade <= items[i].grade);
      }
    });

    test('should return 200 filter max_grade', async (t) => {
      const offset = 0;
      const limit = users.length;
      const max_grade = 8;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        max_grade,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(max_grade >= items[i].grade);
      }
    });

    test('should return 200 filter min_grade and max_grade', async (t) => {
      const offset = 0;
      const limit = users.length;
      const min_grade = 5;
      const max_grade = 8;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_grade,
        max_grade,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(min_grade <= items[i].grade);
        assert.ok(max_grade >= items[i].grade);
      }
    });

    test('should return 200 filter min_birthdate', async (t) => {
      const offset = 0;
      const limit = users.length;
      const min_birthdate = new Date('2000-01-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_birthdate,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(new Date(min_birthdate) <= new Date(items[i].birthdate));
      }
    });

    test('should return 200 filter max_birthdate', async (t) => {
      const offset = 0;
      const limit = users.length;
      const max_birthdate = new Date('2000-01-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        max_birthdate,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(new Date(max_birthdate) >= new Date(items[i].birthdate));
      }
    });

    test('should return 200 filter min_birthdate and max_birthdate', async (t) => {
      const offset = 0;
      const limit = users.length;
      const min_birthdate = new Date('2000-01-01').toISOString();
      const max_birthdate = new Date('2002-01-01').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
        min_birthdate,
        max_birthdate,
      });

      const resp = await request(url, {
        method: userList.method,
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
        assert.ok(new Date(min_birthdate) <= new Date(items[i].birthdate));
        assert.ok(new Date(max_birthdate) >= new Date(items[i].birthdate));
      }
    });

    test('should return 200 and total should not be limited to limit param', async (t) => {
      const offset = 0;
      const limit = 2;
      const name = 'e';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedUsers(db, users);
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
        method: userList.method,
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
