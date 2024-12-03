import { computed } from 'nanostores';
import type { IAdmin, ICredentials } from 'shared/types/auth';
import { createFetcherStore, createMutatorStore } from './_query';

export const ADMIN_KEYS = {
  admin: ['get'],
  login: ['login'],
  logout: ['logout'],
  register: ['register'],
};

export const $admin = createFetcherStore<IAdmin>(ADMIN_KEYS.admin, {
  onErrorRetry: null,
});

export const $isLoggedIn = computed($admin, (admin) => !admin.error);

export const $register = createMutatorStore<ICredentials>(
  ({ data, invalidate }) => {
    invalidate(ADMIN_KEYS.admin);

    return fetch('/api/admin/registration', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
  },
);

export const $login = createMutatorStore<ICredentials>(
  ({ data, invalidate }) => {
    invalidate(ADMIN_KEYS.admin);

    return fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
  },
);

export const $logout = createMutatorStore(({ invalidate }) => {
  invalidate(ADMIN_KEYS.admin);

  return fetch('/api/auth/logout', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  });
});
