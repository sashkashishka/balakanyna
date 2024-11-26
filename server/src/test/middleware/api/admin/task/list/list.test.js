import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as taskList from '../../../../../../middleware/api/admin/task/list/middleware.js';

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
import { getProgram } from '../../fixtures/program.js';
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
    ids,
    userIds,
    programIds,
    types,
    label,
    name,
  },
) {
  const url = getUrl(taskList.route, baseUrl);

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
  if (types) {
    types.forEach((t) => {
      url.searchParams.append('types[]', t);
    });
  }
  if (programIds) {
    programIds.forEach((p) => {
      url.searchParams.append('programIds[]', p);
    });
  }
  if (label) {
    label.forEach((l) => {
      url.searchParams.append('labels[]', l);
    });
  }

  return url;
}

describe('[api] task list', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(taskList.route, {
      method: taskList.method,
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
    const limit = tasks.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedTasks(db, tasks);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
    });

    const resp = await request(url, {
      method: taskList.method,
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
        await seedTasks(db, tasks);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: taskList.method,
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

  test('should return 200 and all tasks', async (t) => {
    const offset = 0;
    const limit = tasks.length;
    let dbTaskLabels = [];

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbLabels = await seedLabels(db, labels);
        const dbTasks = await seedTasks(db, tasks);

        dbTaskLabels = await seedTaskLabels(db, [
          {
            labelId: dbLabels[0].id,
            taskId: dbTasks[0].id,
          },
          {
            labelId: dbLabels[1].id,
            taskId: dbTasks[0].id,
          },
          {
            labelId: dbLabels[1].id,
            taskId: dbTasks[1].id,
          },
          {
            taskId: dbTasks[2].id,
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
      method: taskList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, tasks.length);

    for (let i = 1; i < items.length; i++) {
      assert.ok(
        new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
      );
      assert.ok(Array.isArray(items[i].labels));

      for (let j = 0; j < items[i].labels.length; j++) {
        assert.ok(
          dbTaskLabels.some(
            ({ labelId }) => labelId === items[i].labels[j].id,
          ),
          'label id is from junction table'
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
    const limit = tasks.length / 2;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedTasks(db, tasks);
      },
    });

    const url = getEndpoint(baseUrl, {
      offset,
      limit,
      order_by: 'createdAt',
      dir: 'asc',
    });

    const resp = await request(url, {
      method: taskList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, limit);
    assert.equal(total, tasks.length);

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
      method: taskList.method,
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
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) <= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by createdAt and dir desc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].createdAt) >= new Date(items[i].createdAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir asc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) <= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by updatedAt and dir desc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'updatedAt',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          new Date(items[i - 1].updatedAt) >= new Date(items[i].updatedAt),
        );
      }
    });

    test('should return 200 and order_by name and dir asc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].name.localeCompare(items[i].name), -1);
      }
    });

    test('should return 200 and order_by name and dir desc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'name',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.equal(items[i - 1].name.localeCompare(items[i].name), 1);
      }
    });

    test('should return 200 and order_by type and dir asc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'type',
        dir: 'asc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          [-1, 0].includes(items[i - 1].type.localeCompare(items[i].type)),
        );
      }
    });

    test('should return 200 and order_by type and dir desc', async (t) => {
      const offset = 0;
      const limit = tasks.length / 2;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'type',
        dir: 'desc',
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, tasks.length);

      for (let i = 1; i < items.length; i++) {
        assert.ok(
          [0, 1].includes(items[i - 1].type.localeCompare(items[i].type)),
        );
      }
    });
  });

  describe('[filter]', () => {
    test('should return 200 and filter by name', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const name = 'Task 1';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });

    test('should return 200 and filter by types', async (t) => {
      const offset = 0;
      const limit = tasks.length;

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
        },
      });

      const types = ['semaphoreText'];

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        types,
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      const amount = tasks.reduce((acc, curr) => {
        if (types.includes(curr.type)) {
          acc += 1;
        }
        return acc;
      }, 0);

      assert.equal(resp.status, 200);
      assert.equal(items.length, amount);
      assert.equal(total, amount);

      for (let i = 0; i < items.length; i++) {
        assert.ok(types.includes(items[i].type));
      }
    });

    test('should return 200 filter min_created_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_created_at = new Date('2024-03-14').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
        assert.ok(new Date(min_created_at) <= new Date(items[i].createdAt));
      }
    });

    test('should return 200 filter max_created_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const max_created_at = new Date('2024-03-14').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
      }
    });

    test('should return 200 filter min_created_at and max_created_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_created_at = new Date('2024-03-13').toISOString();
      const max_created_at = new Date('2024-03-17').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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

    test('should return 200 filter min_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_updated_at = new Date('2024-03-14').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
        assert.ok(new Date(min_updated_at) <= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 filter max_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const max_updated_at = new Date('2024-03-14').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
        assert.ok(new Date(max_updated_at) >= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 filter min_updated_at and max_updated_at', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      const min_updated_at = new Date('2024-03-13').toISOString();
      const max_updated_at = new Date('2024-03-17').toISOString();

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
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
        assert.ok(new Date(max_updated_at) >= new Date(items[i].updatedAt));
        assert.ok(new Date(min_updated_at) <= new Date(items[i].updatedAt));
      }
    });

    test('should return 200 and filter by labels', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbTaskLabels = [];
      let labelsList = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbTasks = await seedTasks(db, tasks);
          const dbLabels = await seedLabels(db, labels);

          labelsList = dbLabels.slice(0, 4).map((l) => l.id);

          dbTaskLabels = await seedTaskLabels(
            db,
            labelsList.map((labelId, i) => ({
              taskId: dbTasks[i].id,
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
        method: taskList.method,
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
        assert.equal(items[i].id, dbTaskLabels[i].taskId);
      }
    });

    test('should return 200 and filter by programIds', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbTaskProgram = [];
      let programList = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, [user]);
          const dbPrograms = await seedPrograms(db, [
            getProgram({ userId: dbUsers[0].id }),
            getProgram({ userId: dbUsers[0].id }),
          ]);
          const dbTasks = await seedTasks(db, tasks);

          programList = dbPrograms.map((l) => l.id);

          dbTaskProgram = await seedProgramTask(
            db,
            programList.map((programId, i) => ({
              taskId: dbTasks[i].id,
              programId,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        programIds: programList,
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, dbTaskProgram.length);
      assert.equal(total, dbTaskProgram.length);

      for (let i = 0; i < items.length; i++) {
        assert.equal(items[i].id, dbTaskProgram[i].taskId);
      }
    });

    test('should return 200 and filter by ids', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbTasks = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          dbTasks = await seedTasks(db, tasks);
        },
      });

      const ids = dbTasks.slice(0, 3).map(({ id }) => id);

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        ids,
      });

      const resp = await request(url, {
        method: taskList.method,
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
        assert.equal(items[i].id, dbTasks[i].id);
      }
    });

    test('should return 200 and filter by userIds', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbPrograms = [];
      let userList = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          dbPrograms = await seedPrograms(db, [
            getProgram({ userId: dbUsers[0].id }),
            getProgram({ userId: dbUsers[0].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[2].id }),
            getProgram({ userId: dbUsers[2].id }),
          ]);
          const dbTasks = await seedTasks(db, tasks);

          userList = [dbUsers[1].id];

          await seedProgramTask(
            db,
            dbPrograms.map(({ id: programId }, i) => ({
              taskId: dbTasks[i].id,
              programId,
            })),
          );
        },
      });

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        userIds: userList,
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      const userPrograms = userList.reduce(
        (acc, curr) => acc.concat(dbPrograms.filter((p) => p.userId === curr)),
        [],
      );

      assert.equal(resp.status, 200);
      assert.equal(items.length, userPrograms.length);
      assert.equal(total, userPrograms.length);

      for (let i = 0; i < items.length; i++) {
        assert.equal(items[i].id, userPrograms[i].id);
      }
    });

    test('should return 200 and filter by userIds and programIds', async (t) => {
      const offset = 0;
      const limit = tasks.length;
      let dbPrograms = [];
      let userList = [];

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          const dbUsers = await seedUsers(db, users);
          dbPrograms = await seedPrograms(db, [
            getProgram({ userId: dbUsers[0].id }),
            getProgram({ userId: dbUsers[0].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[1].id }),
            getProgram({ userId: dbUsers[2].id }),
            getProgram({ userId: dbUsers[2].id }),
          ]);
          const dbTasks = await seedTasks(db, tasks);

          userList = [dbUsers[1].id];

          await seedProgramTask(
            db,
            dbPrograms.map(({ id: programId }, i) => ({
              taskId: dbTasks[i].id,
              programId,
            })),
          );
        },
      });

      const userPrograms = userList.reduce(
        (acc, curr) => acc.concat(dbPrograms.filter((p) => p.userId === curr)),
        [],
      );
      const programList = [userPrograms[0].id, userPrograms[1].id];

      const url = getEndpoint(baseUrl, {
        offset,
        limit,
        order_by: 'createdAt',
        dir: 'asc',
        userIds: userList,
        programIds: programList,
      });

      const resp = await request(url, {
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, programList.length);
      assert.equal(total, programList.length);

      for (let i = 0; i < items.length; i++) {
        assert.equal(items[i].id, programList[i]);
      }
    });

    test('should return 200 and total should not be limited to limit param', async (t) => {
      const offset = 0;
      const limit = 2;
      const name = 'Task';

      const { request, baseUrl } = await getTestServer({
        t,
        async seed(db, config) {
          await seedAdmins(db, [admin], config.salt.password);
          await seedTasks(db, tasks);
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
        method: taskList.method,
        headers: {
          cookie: await getAuthCookie(request, admin),
        },
      });
      const body = await resp.json();
      const { items, total } = body;

      assert.equal(resp.status, 200);
      assert.equal(items.length, limit);
      assert.equal(total, 8);

      for (let i = 0; i < items.length; i++) {
        assert.match(items[i].name, new RegExp(name, 'i'));
      }
    });
  });

  test('should return tasks with errors field if schema is not valid', async (t) => {
    const offset = 0;
    const limit = tasks.length;

    const { request, baseUrl } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        await seedTasks(db, [
          tasks[0],
          {
            ...imageSliderTask,
            config: {
              foo: 1,
            },
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
      method: taskList.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();
    const { items, total } = body;

    assert.equal(resp.status, 200);
    assert.equal(items.length, 2);
    assert.equal(total, 2);

    // no error as configuration is valid
    assert.equal(items[0].errors, null);

    // should be error as configuration is invalid
    assert.notEqual(items[1].errors, null);
    assert.ok(items[1].errors instanceof Object);
  });
});
