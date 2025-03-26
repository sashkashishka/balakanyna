import { randomUUID } from 'node:crypto';

export function getRandomId() {
  return randomUUID({ disableEntropyCache: true });
}
