import { pbkdf2Sync } from 'node:crypto';

/**
 * @argument {string} password
 * @argument {string} salt
 */
export function encryptPassword(password, salt) {
  return pbkdf2Sync(password, salt, 5, 40, 'sha256').toString('hex');
}
