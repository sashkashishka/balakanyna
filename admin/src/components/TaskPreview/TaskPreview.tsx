import { useEffect, useId } from 'react';
import type { JSX } from 'solid-js';
import { render, createComponent } from 'solid-js/web';

import {
  SemaphoreText,
  ImageSliderPreview,
  IframeViewer,
  SchulteTable,
  LettersToSyllable,
} from 'client';
import 'client/lib/style.css';

import type { TTaskType, TTask } from 'shared/types/task';

const TASK_MAP: Record<TTaskType, () => JSX.Element> = {
  semaphoreText: SemaphoreText,
  imageSlider: ImageSliderPreview,
  iframeViewer: IframeViewer,
  schulteTable: SchulteTable,
  lettersToSyllable: LettersToSyllable,
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

      return render(() => createComponent(Component, { config }), root!);
    }

    return () => void 0;
  }, [config, id]);

  return (
    <div
      id={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
