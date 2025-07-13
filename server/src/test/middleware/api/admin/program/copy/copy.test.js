import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as programCopy from '../../../../../../middleware/api/admin/program/copy/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedUsers,
  seedTasks,
  seedProgramTask,
} from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { getProgram } from '../../fixtures/program.js';
import { user } from '../../fixtures/user.js';
import { tasks } from '../../fixtures/task.js';
import { programTaskTable } from '../../../../../../db/schema.js';

const hash = '88888888';

describe('[api] program copy', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programCopy.route, {
      method: programCopy.method,
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

    const resp = await request(programCopy.route, {
      method: programCopy.method,
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

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        userId: 1,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'INVALID_PAYLOAD',
      message: 'Invalid payload',
    });
  });

  test('should return 400 if user does not exist', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const program = getProgram({ userId: 1 });

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        userId: 1,
        id: 2,
        startDatetime: program.startDatetime,
        expirationDatetime: program.expirationDatetime,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'USER_DOES_NOT_EXIST',
      message: 'User does not exist',
    });
  });

  test('should return 400 if program does not exist', async (t) => {
    let dbUsers = [];

    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
      },
    });

    const program = getProgram({});

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        userId: dbUsers[0].id,
        id: 2,
        startDatetime: program.startDatetime,
        expirationDatetime: program.expirationDatetime,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'PROGRAM_DOES_NOT_EXIST',
      message: 'Program does not exist',
    });
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
      userId: dbPrograms[0].userId,
      id: dbPrograms[0].id,
      startDatetime: new Date().toISOString(),
      expirationDatetime: new Date(0).toISOString(),
    };

    const resp = await request(programCopy.route, {
      method: programCopy.method,
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

  test('should return 200 and copy all tasks from the source program (tasks list is empty)', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbPrograms = await seedPrograms(db, [
          getProgram({ userId: dbUsers[0].id, hash }),
        ]);
      },
    });

    const startDatetime = new Date();
    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
    };

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.notEqual(body.id, payload.id, 'should create new id');
    assert.notEqual(body.hash, dbPrograms[0].hash, 'should generate new hash');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 0);
    assert.equal(junctionIds.length, 0);
    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and copy all tasks from the source program (tasks list is not empty)', async (t) => {
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
          getProgram({
            hash,
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
              { taskId: dbTasks[0].id },
            ],
            start: new Date(),
            expiration: new Date(new Date().getTime() + 100000),
          }),
        ]);

        await seedProgramTask(db, [
          {
            taskId: dbTasks[0].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[1].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[2].id,
            programId: dbPrograms[0].id,
          },
        ]);
      },
    });

    const startDatetime = new Date();
    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
    };

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.notEqual(body.id, payload.id, 'should create new id');
    assert.notEqual(body.hash, dbPrograms[0].hash, 'should generate new hash');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 4);
    assert.equal(junctionIds.length, 6);

    for (let i = 0; i < body.tasks.length; i++) {
      assert.equal(
        body.tasks[i].taskId,
        dbPrograms[0].tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);
  });

  test('should return 200 and copy duplicates without limitations', async (t) => {
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
          getProgram({
            hash,
            userId: dbUsers[0].id,
            tasks: [
              { taskId: dbTasks[2].id },
              { taskId: dbTasks[0].id },
              { taskId: dbTasks[1].id },
              { taskId: dbTasks[0].id },
            ],
            start: new Date(),
            expiration: new Date(new Date().getTime() + 100000),
          }),
        ]);

        await seedProgramTask(db, [
          {
            taskId: dbTasks[0].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[1].id,
            programId: dbPrograms[0].id,
          },
          {
            taskId: dbTasks[2].id,
            programId: dbPrograms[0].id,
          },
        ]);
      },
    });

    const startDatetime = new Date();
    const payload = {
      id: dbPrograms[0].id,
      userId: dbPrograms[0].userId,
      startDatetime: startDatetime.toISOString(),
      expirationDatetime: new Date(startDatetime.getTime() + 100).toISOString(),
    };

    const resp = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.notEqual(body.id, payload.id, 'should create new id');
    assert.notEqual(body.hash, dbPrograms[0].hash, 'should generate new hash');
    assert.equal(body.name, dbPrograms[0].name);
    assert.equal(body.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body.startDatetime, payload.startDatetime);
    assert.equal(body.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.tasks.length, 4);
    assert.equal(junctionIds.length, 6);

    for (let i = 0; i < body.tasks.length; i++) {
      assert.equal(
        body.tasks[i].taskId,
        dbPrograms[0].tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body.createdAt)), false);
    assert.equal(isNaN(new Date(body.updatedAt)), false);
    assert.equal(Object.keys(body).length, 9);

    // copy duplicate
    const resp2 = await request(programCopy.route, {
      method: programCopy.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body2 = await resp2.json();
    const junctionIds2 = await db.select().from(programTaskTable);

    assert.equal(resp2.status, 200);
    assert.notEqual(body2.id, body.id, 'should create new id');
    assert.notEqual(body2.hash, body.hash, 'should generate new hash');
    assert.equal(body2.name, dbPrograms[0].name);
    assert.equal(body2.userId, dbPrograms[0].userId, 'should not change userId');
    assert.equal(body2.startDatetime, payload.startDatetime);
    assert.equal(body2.expirationDatetime, payload.expirationDatetime);
    assert.ok(Array.isArray(body2.tasks));
    assert.equal(body2.tasks.length, 4);
    assert.equal(junctionIds2.length, 9);

    for (let i = 0; i < body2.tasks.length; i++) {
      assert.equal(
        body2.tasks[i].taskId,
        dbPrograms[0].tasks[i].taskId,
        'should save in the same order',
      );
    }

    assert.equal(isNaN(new Date(body2.createdAt)), false);
    assert.equal(isNaN(new Date(body2.updatedAt)), false);
    assert.equal(Object.keys(body2).length, 9);
  });
});
