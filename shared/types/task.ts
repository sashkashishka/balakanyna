import type { ILabel } from './label.ts';
import type { IImageEntry } from './image.ts';

export type TTaskType =
  | 'imageSlider'
  | 'semaphoreText'
  | 'wordwall'
  | 'schulteTable';

interface ITask {
  id: number;
  name: number;
  labels: ILabel[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: Record<string, any>;
}

interface ISemaphoreTextTask extends ITask {
  type: Extract<TTaskType, 'semaphoreText'>;
  config: {
    colors: string[];
    text: string[];
    delayRange: number[];
  };
}

interface IImageSliderTask extends ITask {
  type: Extract<TTaskType, 'imageSlider'>;
  config: {
    title: string;
    slides: {
      image: IImageEntry;
    }[];
  };
}

interface IWordwallTask extends ITask {
  type: Extract<TTaskType, 'wordwall'>;
  config: {
    link: string;
  };
}

interface ISchulteTableTask extends ITask {
  type: Extract<TTaskType, 'schulteTable'>;
  config: {
    x: number;
    y: number;
    reverse: boolean;
  };
}

export type TTask =
  | ISemaphoreTextTask
  | IImageSliderTask
  | IWordwallTask
  | ISchulteTableTask;
