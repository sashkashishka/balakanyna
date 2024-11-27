import { type ReadableAtom } from 'nanostores';
import type { IPaginatorResponse } from '@/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { type IFilters } from './_list-filter';
import type { TTask, TTaskType } from '@/types/task';
import { getSearchParam } from '@/utils/network';

export interface ITaskListFilters extends IFilters {
  min_created_at?: string;
  max_created_at?: string;
  min_updated_at?: string;
  max_updated_at?: string;
  name?: string;
  ids?: number[];
  userIds?: number[];
  type?: TTaskType[];
  programIds?: number[];
  labels?: number[];
}

export const defaultTaskListFilters: ITaskListFilters = {
  page: 1,
  order_by: 'updatedAt',
  dir: 'descend',
};

export const TASK_KEYS = {
  list: 'task/list',
  getList(search: ReadableAtom<string>) {
    return [this.list, search];
  },
  task: 'task/get',
  getTask(taskId: string | number) {
    return ['task/get', getSearchParam('id', taskId)];
  },
};

// list and item fetcher store fabrics
export function makeTasksStore(search: ReadableAtom<string>) {
  const $tasks = createFetcherStore<IPaginatorResponse<TTask>>(
    TASK_KEYS.getList(search),
  );
  return $tasks;
}

export function makeTaskStore(taskId: string | number) {
  const $task = createFetcherStore<TTask>(TASK_KEYS.getTask(taskId));

  return $task;
}

// mutators
export const $createTask = createMutatorStore<TTask>(
  async ({ data, invalidate }) => {
    const resp = await fetch('/api/admin/task/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(TASK_KEYS.list) || k.startsWith(TASK_KEYS.task),
    );

    return resp;
  },
);

export const $updateTask = createMutatorStore<TTask>(
  async ({ data, invalidate }) => {
    const resp = await fetch(`/api/admin/task/update?id=${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(TASK_KEYS.list) || k.startsWith(TASK_KEYS.task),
    );

    return resp;
  },
);
