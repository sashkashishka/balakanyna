import { type ReadableAtom } from 'nanostores';
import type { IUser } from '@/types/user';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { type IFilters } from './_list-filter';
import { getSearchParam } from '@/utils/network';

export interface IUserListFilters extends IFilters {
  min_created_at?: string;
  max_created_at?: string;
  min_birthdate?: string;
  max_birthdate?: string;
  min_grade?: number;
  max_grade?: number;
  name?: string;
}

export const defaultUserListFilters: IUserListFilters = {
  page: 1,
  order_by: 'updatedAt',
  dir: 'descend',
};

export const USER_KEYS = {
  list: 'user/list',
  getList(search: ReadableAtom<string>) {
    return [this.list, search];
  },
  user: 'user/get',
  getUser(userId: number | string) {
    return [this.user, getSearchParam('id', userId)];
  },
  search: 'user/search',
  getSearch(search: ReadableAtom<string>) {
    return [this.search, search];
  },
};

// list and item fetcher store fabrics
export function makeUsersStore(search: ReadableAtom<string>) {
  const $users = createFetcherStore<IPaginatorResponse<IUser>>(
    USER_KEYS.getList(search),
  );

  return $users;
}

export function makeUserStore(userId: string | number) {
  const $user = createFetcherStore<IUser>(USER_KEYS.getUser(userId));

  return $user;
}

export function makeUserSearchStore(search: ReadableAtom<string>) {
  const $userSearch = createFetcherStore<IUser[]>(USER_KEYS.getSearch(search));
  return $userSearch;
}

// mutators
export const $createUser = createMutatorStore<IUser>(
  async ({ data, invalidate }) => {
    const resp = await fetch('/api/admin/user/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(USER_KEYS.user) || k.startsWith(USER_KEYS.list),
    );

    return resp;
  },
);

export const $updateUser = createMutatorStore<IUser>(
  async ({ data, invalidate }) => {
    const resp = await fetch(`/api/admin/user/update?id=${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(USER_KEYS.user) || k.startsWith(USER_KEYS.list),
    );

    return resp;
  },
);
