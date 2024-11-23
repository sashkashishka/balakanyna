import dayjs from 'dayjs';
import type { DescriptionsProps } from 'antd';
import { computed } from 'nanostores';
import type { IUser } from '@/types/user';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { createListFilters, type IFilters } from './_list-filter';
import { $router, ROUTE_ALIAS } from './router';
import { formatDate } from '@/utils/date';
import { getIdSearchParam } from '@/utils/network';

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
  order_by: 'createdAt',
  dir: 'descend',
};

export const {
  $pageSize,
  $filters,
  $activeFilterCount,
  $filtersSearchParams,
  setPageSize,
  setListFilter,
  resetListFilter,
} = createListFilters(defaultUserListFilters);

export const $userId = computed([$router], (router) => {
  const defaultValue = '0';

  if (!router) return defaultValue;

  const { route, params } = router;

  switch (route) {
    case ROUTE_ALIAS.USER_VIEW_PROGRAMS:
    case ROUTE_ALIAS.USER_VIEW_TASKS:
    case ROUTE_ALIAS.USER_VIEW: {
      return 'uid' in params ? params.uid : defaultValue;
    }

    default:
      return defaultValue;
  }
});
const $userIdSearchParam = computed([$userId], (userId) => {
  if (!userId) return '';
  return getIdSearchParam(userId);
});

export const USER_KEYS = {
  list: 'user/list',
  filteredList() {
    return [this.list, $filtersSearchParams];
  },
  user: 'user/get',
  getUser() {
    return [this.user, $userIdSearchParam];
  },
};

export const $users = createFetcherStore<IPaginatorResponse<IUser>>(
  USER_KEYS.filteredList(),
);

export const $user = createFetcherStore<IUser>(USER_KEYS.getUser());
export const $userFormValues = computed([$user], ({ data, loading, error }) => {
  if (loading || error || !data) return undefined;

  return {
    ...data,
    birthdate: dayjs(data.birthdate),
  };
});
export const $userDescriptionItems = computed(
  [$user],
  ({ data, error, loading }) => {
    if (error || loading) return [];

    return Object.keys(data || {}).reduce<DescriptionsProps['items']>(
      (acc, val, i) => {
        const key = val as keyof IUser;

        if (key === 'id') return acc;

        let children = data?.[key];

        if (key === 'birthdate') {
          children = formatDate(data![key]!);
        }

        acc!.push({
          key: String(i),
          label: key,
          children,
        });

        return acc;
      },
      [],
    );
  },
);

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
