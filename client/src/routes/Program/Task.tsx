import { createResource, lazy, Match, Show, Suspense, Switch } from 'solid-js';
import { fetchTask } from './utils.ts';
import type { TTaskType } from 'shared/types/task.ts';

const TASKS: Record<TTaskType, ReturnType<typeof lazy>> = {
  imageSlider: lazy(() => import('@/tasks/ImageSlider/index.ts')),
  brainbox: lazy(() => import('@/tasks/Brainbox/index.ts')),
  semaphoreText: lazy(() => import('@/tasks/SemaphoreText/index.ts')),
  iframeViewer: lazy(() => import('@/tasks/IframeViewer/index.ts')),
  schulteTable: lazy(() => import('@/tasks/SchulteTable/index.ts')),
  lettersToSyllable: lazy(() => import('@/tasks/LettersToSyllable/index.ts')),
  findFlashingNumber: lazy(() => import('@/tasks/FindFlashingNumber/index.ts')),
  goneAndFound: lazy(() => import('@/tasks/GoneAndFound/index.ts')),
};

interface IProps {
  id?: string;
}

export function Task(props: IProps) {
  const id = () => props.id;

  const [task] = createResource(id, fetchTask);

  return (
    <>
      <Show when={task.loading}>
        <p>Loading...</p>
      </Show>
      <Switch>
        <Match when={task.error}>
          <span>Error: {task.error?.message}</span>
        </Match>
        <Match when={task()}>
          <Show when={task()} keyed>
            {(task) => {
              const Component = TASKS[task.type];

              if (!Component) return null;

              return (
                <Suspense>
                  <Component config={task.config} />
                </Suspense>
              );
            }}
          </Show>
        </Match>
      </Switch>
    </>
  );
}
