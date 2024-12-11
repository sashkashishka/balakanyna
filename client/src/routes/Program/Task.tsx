import { createResource, lazy, Match, Show, Suspense, Switch } from 'solid-js';
import { fetchTask } from './utils.ts';

const ImageSliderTask = lazy(() => import('@/tasks/ImageSlider/index.ts'));
const SemaphoreTextTask = lazy(() => import('@/tasks/SemaphoreText/index.ts'));

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
              switch (task.type) {
                case 'imageSlider':
                  return (
                    <Suspense>
                      <ImageSliderTask config={task.config} />
                    </Suspense>
                  );

                case 'semaphoreText':
                  return (
                    <Suspense>
                      <SemaphoreTextTask config={task.config} />
                    </Suspense>
                  );

                default:
                  return null;
              }
            }}
          </Show>
        </Match>
      </Switch>
    </>
  );
}
