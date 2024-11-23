import { type ReadableAtom } from 'nanostores';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { type IFilters } from './_list-filter';
import type { IProgram, IProgramFull } from '@/types/program';
import { getIdSearchParam } from '@/utils/network';

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

export const PROGRAM_KEYS = {
  list: 'program/list',
  getList(search: ReadableAtom<string>) {
    return [this.list, search];
  },
  program: 'program/get',
  getProgram(programId: string | number) {
    return ['program/get', getIdSearchParam(programId)];
  },
};

// list and item fetcher store fabrics
export function makeProgramsStore(search: ReadableAtom<string>) {
  const $programs = createFetcherStore<IPaginatorResponse<IProgram>>(
    PROGRAM_KEYS.getList(search),
  );
  return $programs;
}

export function makeProgramStore(programId: string | number) {
  const $program = createFetcherStore<IProgramFull>(
    PROGRAM_KEYS.getProgram(programId),
  );

  return $program;
}

// mutators
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
