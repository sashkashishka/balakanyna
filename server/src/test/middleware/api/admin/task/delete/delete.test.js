import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import { getUrl } from '../../../../../../utils/network.js';

import * as taskDelete from '../../../../../../middleware/api/admin/task/delete/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedProgramTask,
  seedTasks,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { imageSliderTask } from '../../fixtures/task.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';

function getEndpoint(baseUrl, { id }) {
  const url = getUrl(taskDelete.route, baseUrl);

  url.searchParams.set('id', id);

  return url;
}

describe('[api] task delete', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
    });

    const resp = await request(taskDelete.route, {
      method: taskDelete.method,
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
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(taskDelete.route, {
      method: taskDelete.method,
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

  test('should return 400 if search parasm are invalid', async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 'boo' });

    const resp = await request(endpoint, {
      method: taskDelete.method,
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

  test('should return 404 if task does not exists', async (t) => {
    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: 1 });

    const resp = await request(endpoint, {
      method: taskDelete.method,
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

  test('should return 400 if task has relations to at least one program', async (t) => {
    let dbTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        const dbUsers = await seedUsers(db, [user]);
        const dbPrograms = await seedPrograms(db, [getProgram(dbUsers[0].id)]);
        dbTasks = await seedTasks(db, [imageSliderTask]);

        await seedProgramTask(db, [
          { taskId: dbTasks[0].id, programId: dbPrograms[0].id },
        ]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskDelete.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DELETE_RELATION',
      message: 'Cannot delete because of relation',
    });
  });

  test('should return 200 if task was deleted', async (t) => {
    let dbTasks = [];

    const { request, baseUrl } = await getTestServer({
      t,
      config: {
        salt: { password: '123' },
      },
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbTasks = await seedTasks(db, [imageSliderTask]);
      },
    });

    const endpoint = getEndpoint(baseUrl, { id: dbTasks[0].id });

    const resp = await request(endpoint, {
      method: taskDelete.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.deepEqual(body, {
      ok: true,
    });
  });
});
