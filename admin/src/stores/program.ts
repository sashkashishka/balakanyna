import dayjs from 'dayjs';
import { atom, computed } from 'nanostores';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { createListFilters, type IFilters } from './_list-filter';
import { $router, ROUTE_ALIAS } from './router';
import { getIdSearchParam } from '@/utils/network';
import type { IProgram, IProgramFull } from '@/types/program';

export interface IProgramListFilters extends IFilters {
  min_created_at?: string;
  max_created_at?: string;
  min_updated_at?: string;
  max_updated_at?: string;
  min_start_datetime?: string;
  max_start_datetime?: string;
  min_expiration_datetime?: string;
  max_expiration_datetime?: string;
  min_grade?: number;
  max_grade?: number;
  name?: string;
  ids?: number[];
  userIds?: number[];
}

export const defaultProgramListFilters: IProgramListFilters = {
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
} = createListFilters(defaultProgramListFilters);

export const $programId = computed([$router], (router) => {
  const defaultValue = '0';

  if (!router) return defaultValue;

  const { route, params } = router;

  switch (route) {
    case ROUTE_ALIAS.PROGRAM_VIEW: {
      return 'pid' in params ? params.pid : defaultValue;
    }

    default:
      return defaultValue;
  }
});
export const $programIdSearchParam = computed([$programId], (programId) => {
  if (!programId) return '';
  return getIdSearchParam(programId);
});

export const PROGRAM_KEYS = {
  list: 'program/list',
  getList(search = $filtersSearchParams) {
    return [this.list, search];
  },
  program: 'program/get',
  getProgram(search = $programIdSearchParam) {
    return ['program/get', search];
  },
};

export function makeProgramsStore(search = $filtersSearchParams) {
  const $programs = createFetcherStore<IPaginatorResponse<IProgram>>(
    PROGRAM_KEYS.getList(search),
  );
  return $programs;
}
export const $programs = makeProgramsStore();

export function makeProgramStore(search = $programIdSearchParam) {
  const $program = createFetcherStore<IProgramFull>(
    PROGRAM_KEYS.getProgram(search),
  );
  const $programFormValues = computed(
    [$program],
    ({ data, loading, error }) => {
      if (loading || error || !data) return undefined;

      return {
        ...data,
        startDatetime: dayjs(data.startDatetime),
        expirationDatetime: dayjs(data.expirationDatetime),
      };
    },
  );

  return { $program, $programFormValues };
}
export const { $program, $programFormValues } = makeProgramStore();

export const $createProgram = createMutatorStore<IProgram>(
  async ({ data, invalidate }) => {
    const resp = await fetch('/api/admin/program/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) =>
        k.startsWith(PROGRAM_KEYS.list) || k.startsWith(PROGRAM_KEYS.program),
    );

    return resp;
  },
);

export const $updateProgram = createMutatorStore<IProgram>(
  async ({ data, invalidate }) => {
    const resp = await fetch(`/api/admin/program/update?id=${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) =>
        k.startsWith(PROGRAM_KEYS.list) || k.startsWith(PROGRAM_KEYS.program),
    );

    return resp;
  },
);
