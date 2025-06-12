import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie, sleep } from '../../../../../helpers/utils.js';

import * as programUpdate from '../../../../../../middleware/api/admin/program/update/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedTasks,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';
import { tasks } from '../../fixtures/task.js';
import { programTaskTable } from '../../../../../../db/schema.js';

describe('[api] program update', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
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

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
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

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        name: 'Task2',
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 404 if program does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 1,
        ...getProgram({ userId: 1 }),
        tasks: [],
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 404);
    assert.deepEqual(body, {
      error: 'NOT_FOUND',
      message: 'Not Found',
    });
  });

  test('should return 400 if provide a non existent task id', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: new Date().toISOString(),
      expirationDatetime: new Date(0).toISOString(),
      tasks: [{ taskId: 1 }],
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'TASK_DOES_NOT_EXIST',
      message: 'Task does not exist',
    });
  });

  test('should return 200 if provide repetetive tasks in an array', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    await sleep(1000);

    const startDatetime = new Date();
    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
      tasks: [
        {
          taskId: dbTasks[0].id,
        },
        {
          taskId: dbTasks[1].id,
        },
        {
          taskId: dbTasks[0].id,
        },
      ],
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.equal(body.id, payload.id);
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, payload.tasks.length);
    assert.equal(junctionIds.length, 2);

    for (let i = 0; i < body.tasks.length; i++) {
      assert.equal(
        body.tasks[i].taskId,
        payload.tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );
    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbPrograms[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbPrograms[0].createdAt).getTime(),
    );
  });

  test('should remove previous ids from junction table and tasks column and populate with new ones', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    await sleep(1000);

    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: dbPrograms[0].startDatetime,
      expirationDatetime: dbPrograms[0].expirationDatetime,
      tasks: [
        {
          taskId: dbTasks[0].id,
        },
        {
          taskId: dbTasks[1].id,
        },
        {
          taskId: dbTasks[2].id,
        },
      ],
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, payload.tasks.length);
    assert.equal(junctionIds.length, payload.tasks.length);

    for (let i = 0; i < body.tasks.length; i++) {
      assert.equal(
        body.tasks[i].taskId,
        payload.tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );
    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbPrograms[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbPrograms[0].createdAt).getTime(),
    );

    await sleep(1000);

    // remove one task
    const payload2 = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: dbPrograms[0].startDatetime,
      expirationDatetime: dbPrograms[0].expirationDatetime,
      tasks: [
        {
          taskId: dbTasks[0].id,
        },
        {
          taskId: dbTasks[1].id,
        },
      ],
    };

    const resp2 = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload2,
    });
    const body2 = await resp2.json();

    const junctionIds2 = await db.select().from(programTaskTable);

    assert.equal(resp2.status, 200);
    assert.equal(body2.id, payload2.id);
    assert.equal(body2.hash.length, 8);
    assert.equal(body2.name, payload2.name);
    assert.equal(
      body2.userId,
      dbPrograms[0].userId,
      'should not change userId',
    );
    assert.equal(body2.startDatetime, payload2.startDatetime);
    assert.equal(body2.expirationDatetime, payload2.expirationDatetime);
    assert.ok(Array.isArray(body2.tasks));
    assert.equal(body2.tasks.length, payload2.tasks.length);
    assert.equal(
      junctionIds2.length,
      payload2.tasks.length,
      'should not left dangling ids and be in sync with tasks column',
    );

    for (let i = 0; i < body2.tasks.length; i++) {
      assert.equal(
        body2.tasks[i].taskId,
        payload2.tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body2.createdAt)), false);
    assert.equal(isNaN(new Date(body2.updatedAt)), false);
    assert.equal(Object.keys(body2).length, 9);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );
    assert.notEqual(
      new Date(body2.updatedAt).getTime(),
      new Date(body.updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body2.createdAt).getTime(),
      new Date(body.createdAt).getTime(),
    );
  });

  test('should return 400 and validate that startDatetime should be lower than expirationDatetime', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      name: 'NewProgram',
      startDatetime: new Date().toISOString(),
      expirationDatetime: new Date(0).toISOString(),
      tasks: [],
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'DATES_COMPLIANCE',
      message: 'Dates compliance',
    });
  });

  test('should update program and not overwrite user_id', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id }),
        ]);
      },
    });

    await sleep(1000);

    const startDatetime = new Date();

    const payload = {
      id: dbPrograms[0].id,
      userId: 3,
      name: 'NewProgram',
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
      tasks: [],
    };

    const resp = await request(programUpdate.route, {
      method: programUpdate.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(typeof body.id, 'number');
    assert.equal(body.hash.length, 8);
    assert.equal(body.name, payload.name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);

    assert.doesNotMatch(
      body.updatedAt,
      /T/,
      'use sqlite datetime to update column',
    );
    assert.notEqual(
      new Date(body.updatedAt).getTime(),
      new Date(dbPrograms[0].updatedAt).getTime(),
      'should update updatetAt field',
    );
    assert.equal(
      new Date(body.createdAt).getTime(),
      new Date(dbPrograms[0].createdAt).getTime(),
    );
  });
});
