import { atom, computed } from 'nanostores';
import type { IUser } from '@/types/user';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { createListFilters, type IFilters } from './_list-filter';

interface IUserListFilters extends IFilters {
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
  order_by: 'createdAt',
  dir: 'descend',
};

export const $pageSize = atom(20);

export function setPageSize(v: number) {
  $pageSize.set(v);
}

export const {
  $filters,
  $activeFilterCount,
  $filtersSearchParams,
  setListFilter,
  resetListFilter,
} = createListFilters(defaultUserListFilters, { limit: $pageSize });

export const $userId = atom<string>('');
const $userIdSearchParam = computed([$userId], (userId) => {
  if (!userId) return '';
  const searchParams = new URLSearchParams();
  searchParams.set('id', userId);
  return `?${searchParams.toString()}`;
});

export function setUserId(id: string) {
  $userId.set(id);
}

export const USER_KEYS = {
  list: 'user/list',
  filteredList() {
    return [this.list, $filtersSearchParams];
  },
  user: ['user/get', $userIdSearchParam],
};

export const $users = createFetcherStore<IPaginatorResponse<IUser>>(
  USER_KEYS.filteredList(),
);

export const $user = createFetcherStore<IUser>(USER_KEYS.user);
