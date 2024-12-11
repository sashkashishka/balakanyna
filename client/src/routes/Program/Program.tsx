import { createResource, Show, Switch, Match } from 'solid-js';
import { useRouter } from '@/core/router/router.tsx';

import { fetchProgram } from './utils.ts';
import { NotFoundPage } from '../NotFound/NotFound.tsx';
import { TaskList } from './TaskList.tsx';
import { Task } from './Task.tsx';
import { TaskFallback } from './TaskFallback.tsx';

import styles from './Program.module.css';

export function ProgramPage() {
  const router = useRouter();

  const [program] = createResource(router, fetchProgram);

  const tid = () => router?.params?.tid;

  return (
    <div class={styles.container}>
      <Show when={program.loading}>
        <p>Loading...</p>
      </Show>
      <Switch>
        <Match when={program?.error?.message === 'NOT_FOUND'}>
          <NotFoundPage />
        </Match>
        <Match when={program.error}>
          <span>Error: {program.error?.message}</span>
        </Match>
        <Match when={program()}>
          <div class={styles.programContainer}>
            <div class={styles.taskContainer}>
              <Switch fallback={<TaskFallback />}>
                <Match when={tid()}>
                  <Task id={tid()} />
                </Match>
              </Switch>
            </div>
            <TaskList tasks={program()?.tasks} />
          </div>
        </Match>
      </Switch>
    </div>
  );
}
