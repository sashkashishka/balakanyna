import { encryptPassword } from '../utils/encryptPassword.js';
import {
  adminTable,
  labelTable,
  programTable,
  programTaskTable,
  taskLabelTable,
  taskTable,
  userTable,
} from './schema.js';

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} admins
 */
export function seedAdmins(db, admins, salt) {
  return db.insert(adminTable).values(
    admins.map((v) => ({
      ...v,
      password: encryptPassword(v.password, salt),
    })),
  );
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} users
 */
export function seedUsers(db, users) {
  return db.insert(userTable).values(users);
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} programs
 */
export function seedPrograms(db, programs) {
  return db.insert(programTable).values(programs);
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} tasks
 */
export function seedTasks(db, tasks) {
  return db.insert(taskTable).values(tasks);
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} labels
 */
export function seedLabels(db, labels) {
  return db.insert(labelTable).values(labels);
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} programTasks
 */
export function seedProgramTask(db, programTasks) {
  return db.insert(programTaskTable).values(programTasks);
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} taskLabels
 */
export function seedTaskLabels(db, taskLabels) {
  return db.insert(taskLabelTable).values(taskLabels);
}