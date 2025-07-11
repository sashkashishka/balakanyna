import type { ILabel } from './label.ts';
import type { IImageEntry } from './image.ts';

export type TTaskType =
  | 'imageSlider'
  | 'semaphoreText'
  | 'iframeViewer'
  | 'lettersToSyllable'
  | 'findFlashingNumber'
  | 'goneAndFound'
  | 'brainbox'
  | 'schulteTable';

interface ITask {
  id: number;
  hash: number;
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
    timer?: { duration: number };
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

interface IIframeViewerTask extends ITask {
  type: Extract<TTaskType, 'iframeViewer'>;
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

interface ILettersToSyllableTask extends ITask {
  type: Extract<TTaskType, 'lettersToSyllable'>;
  config: {
    list: Array<{
      first: string;
      last: string;
      vowelColor?: string;
    }>;
  };
}

interface IFindFlashingNumberTask extends ITask {
  type: Extract<TTaskType, 'findFlashingNumber'>;
  config: {
    duration: number;
    streak: { length: number };
    animation: {
      min: number;
      max: number;
    };
    positionalDigit: {
      min: number;
      max: number;
    };
    y: {
      min: number;
      max: number;
    };
    x: {
      min: number;
      max: number;
    };
  };
}

interface IGoneAndFoundTask extends ITask {
  type: Extract<TTaskType, 'goneAndFound'>;
  config: {
    limit: {
      type: 'timer' | 'rounds';
      value: number;
    };
    preset: 'default';
    items: {
      min: number;
      max: number;
    };
    y: {
      min: number;
      max: number;
    };
  };
}

interface IBrainboxTask extends ITask {
  type: Extract<TTaskType, 'brainbox'>;
  config: {
    items: Array<{
      front: IImageEntry;
      back: IImageEntry;
    }>;
  };
}

export type TTask =
  | ISemaphoreTextTask
  | IImageSliderTask
  | IBrainboxTask
  | IIframeViewerTask
  | ILettersToSyllableTask
  | IFindFlashingNumberTask
  | IGoneAndFoundTask
  | ISchulteTableTask;
