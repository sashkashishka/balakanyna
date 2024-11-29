import { useEffect } from 'react';
import { render, createComponent } from 'solid-js/web';

import { SemaphoreText } from 'client';

import type { TTaskType } from './types/task';

interface IProps {
  type: TTaskType;
}

export function RenderTask({ type }: IProps) {
  useEffect(() => {
    switch (type) {
      case 'semaphoreText': {
        const root = document.getElementById('foo');

        return render(() => createComponent(SemaphoreText, {}), root!);
      }

      default:
        return () => void 0;
    }
  }, []);

  return <div id="foo" />;
}
