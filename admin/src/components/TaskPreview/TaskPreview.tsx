import { useEffect, useId } from 'react';
import { render, createComponent } from 'solid-js/web';

import { SemaphoreText } from 'client';
import 'client/lib/style.css'

import type { TTaskType, TTask } from 'shared/types/task';

const TASK_MAP: Record<TTaskType, () => unknown> = {
  semaphoreText: SemaphoreText,
  imageSlider: undefined,
};

interface IProps {
  type: TTaskType;
  config: TTask['config'];
}

export function TaskPreview({ type, config }: IProps) {
  const id = useId();

  useEffect(() => {
    const Component = TASK_MAP[type];

    if (Component) {
      const root = document.getElementById(id);

      return render(() => createComponent(SemaphoreText, { config }), root!);
    }

    return () => void 0;
  }, [config, id]);

  return <div id={id} />;
}
