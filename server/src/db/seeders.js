import { encryptPassword } from '../utils/encryptPassword.js';
import {
  adminTable,
  imageTable,
  labelImageTable,
  labelTable,
  programTable,
  programTaskTable,
  taskImageTable,
  taskLabelTable,
  taskTable,
  userTable,
} from './schema.js';

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} admins
 */
export function seedAdmins(db, admins, salt) {
  return db
    .insert(adminTable)
    .values(
      admins.map((v) => ({
        ...v,
        password: encryptPassword(v.password, salt),
      })),
    )
    .returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} users
 */
export function seedUsers(db, users) {
  return db.insert(userTable).values(users).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} programs
 */
export function seedPrograms(db, programs) {
  return db.insert(programTable).values(programs).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} tasks
 */
export function seedTasks(db, tasks) {
  return db.insert(taskTable).values(tasks).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} labels
 */
export function seedLabels(db, labels) {
  return db.insert(labelTable).values(labels).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} images
 */
export function seedImages(db, images) {
  return db.insert(imageTable).values(images).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} programTasks
 */
export function seedProgramTask(db, programTasks) {
  return db.insert(programTaskTable).values(programTasks).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} taskLabels
 */
export function seedTaskLabels(db, taskLabels) {
  return db.insert(taskLabelTable).values(taskLabels).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} labelImages
 */
export function seedImageLabels(db, labelImages) {
  return db.insert(labelImageTable).values(labelImages).returning();
}

/**
 * @argument {import('./index.js').IDb} db
 * @argument {Array<unknown>} taskImages
 */
export function seedTaskImages(db, taskImages) {
  return db.insert(taskImageTable).values(taskImages).returning();
}
