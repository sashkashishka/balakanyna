import { createMutatorStore, invalidateKeys } from './_query';
import type {
  ILinkImageLabel,
  ILinkTaskLabel,
} from '@/types/link';
import { TASK_KEYS } from './task';
import { LABEL_KEYS } from './label';
import { IMAGE_KEYS } from './image';

// mutators
export const $linkTaskLabel = createMutatorStore<ILinkTaskLabel>(
  async ({ data }) => {
    const resp = await fetch('/api/admin/link/label/task', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    return resp;
  },
);

export const $unlinkTaskLabel = createMutatorStore<ILinkTaskLabel>(
  async ({ data }) => {
    const resp = await fetch('/api/admin/unlink/label/task', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    return resp;
  },
);

export function invalidateTaskLabel() {
  invalidateKeys(
    (k) =>
      k.startsWith(TASK_KEYS.list) ||
      k.startsWith(LABEL_KEYS.list) ||
      k.startsWith(TASK_KEYS.task),
  );
}

export const $linkImageLabel = createMutatorStore<ILinkImageLabel>(
  async ({ data }) => {
    const resp = await fetch('/api/admin/link/label/image', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    return resp;
  },
);

export const $unlinkImageLabel = createMutatorStore<ILinkImageLabel>(
  async ({ data }) => {
    const resp = await fetch('/api/admin/unlink/label/image', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    return resp;
  },
);

export function invalidateImageLabel() {
  invalidateKeys(
    (k) =>
      k.startsWith(IMAGE_KEYS.list) ||
      k.startsWith(LABEL_KEYS.list) ||
      k.startsWith(IMAGE_KEYS.image),
  );
}
