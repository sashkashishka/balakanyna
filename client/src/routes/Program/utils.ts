import type { IProgramFull } from 'shared/types/program.ts';
import type { TTask } from 'shared/types/task.ts';
import type { IRoute } from '@/core/router/types.ts';
import { ALIASES, ROUTES } from '../constants.ts';

export async function fetchProgram(router: IRoute): Promise<IProgramFull> {
  if (!router?.params?.pid) {
    throw new Error('No program id has been provided');
  }

  const response = await fetch(
    `/api/client/program/get?id=${router.params.pid}`,
  );

  if (response.ok) {
    return response.json();
  }

  const data = await response.json();

  throw new Error(data?.error || 'Unexpected error');
}

export async function fetchTask(id: string): Promise<TTask> {
  if (!id) {
    throw new Error('No task id has been provided');
  }

  const response = await fetch(`/api/client/task/get?id=${id}`);

  if (response.ok) {
    return response.json();
  }

  const data = await response.json();

  throw new Error(data?.error || 'Unexpected error');
}

export function getTaskHref(pid?: string, tid?: string) {
  return ROUTES[ALIASES.TASK]?.replace(':pid', pid!)?.replace(':tid', tid!);
}
