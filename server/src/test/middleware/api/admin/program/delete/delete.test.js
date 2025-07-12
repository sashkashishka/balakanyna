import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { programTaskTable, programTable } from '../../../../../../db/schema.js';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';

import * as programDelete from '../../../../../../middleware/api/admin/program/delete/middleware.js';

import {
  seedAdmins,
  seedPrograms,
  seedProgramTask,
  seedTasks,
  seedUsers,
} from '../../../../../../db/seeders.js';

import { admin } from '../../fixtures/admin.js';
import { user } from '../../fixtures/user.js';
import { getProgram } from '../../fixtures/program.js';
import { tasks } from '../../fixtures/task.js';

describe('[api] program delete', async () => {
  test('should return 401 if unauthorized', async (t) => {
    const { request } = await getTestServer({
      t,
    });

    const resp = await request(programDelete.route, {
      method: programDelete.method,
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

    const resp = await request(programDelete.route, {
      method: programDelete.method,
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

  test('should return 400 if program does not exists', async (t) => {
    const { request } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
      },
    });

    const resp = await request(programDelete.route, {
      method: programDelete.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: {
        id: 1,
      },
    });
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.deepEqual(body, {
      error: 'PROGRAM_DOES_NOT_EXIST',
      message: 'Program does not exist',
    });
  });

  test('should delete task and remove previous ids from junction table and tasks column', async (t) => {
    let dbUsers = [];
    let dbPrograms = [];
    let dbTasks = [];
    let dbProgramTask = [];

    const { request, db } = await getTestServer({
      t,
      async seed(db, config) {
        await seedAdmins(db, [admin], config.salt.password);
        dbUsers = await seedUsers(db, [user]);
        dbTasks = await seedTasks(db, tasks);
        dbPrograms = await seedPrograms(db, [
          getProgram({
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

        dbProgramTask = await seedProgramTask(db, [
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

    const payload = {
      id: dbPrograms[0].id,
    };

    const resp = await request(programDelete.route, {
      method: programDelete.method,
      headers: {
        cookie: await getAuthCookie(request, admin),
      },
      body: payload,
    });
    const body = await resp.json();
    const programIds = await db.select().from(programTable);
    const junctionIds = await db.select().from(programTaskTable);

    assert.equal(resp.status, 200);
    assert.equal(body.id, payload.id);
    assert.equal(body.result, 'ok');
    assert.equal(
      dbPrograms.length - programIds.length,
      1,
      'should remove everything from the db',
    );
    assert.equal(
      dbProgramTask.length - junctionIds.length,
      3,
      'should remove everything from the db',
    );
  });
});
