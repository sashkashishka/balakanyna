import type { ILabel } from './label';
import type { IImageEntry } from './image';

export type TTaskType = 'semaphoreText' | 'imageSlider';

interface ITask {
  id: number;
  name: number;
  labels: ILabel[];
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

export type TTask = ISemaphoreTextTask | IImageSliderTask;
