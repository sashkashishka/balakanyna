export type TTaskType = 'semaphoreText' | 'imageSlider';

interface ITask {
  id: number;
  name: number;
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
      image: {
        id: number;
        hashsum: string;
        filename: string;
        path: string;
      };
    }[];
  };
}

export type TTask = ISemaphoreTextTask | IImageSliderTask;
