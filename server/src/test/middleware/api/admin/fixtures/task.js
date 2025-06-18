export const imageSliderTask = {
  name: 'slider task',
  type: 'imageSlider',
  config: {
    slides: [
      {
        image: {
          id: 1,
        },
      },
    ],
    title: 'Hello',
  },
};

export const semaphoreTextTask = {
  name: 'Task 7',
  type: 'semaphoreText',
  config: {
    colors: ['yellow'],
    delayRange: [3, 4],
    text: ['c'],
  },
  createdAt: '2024-03-16T00:00:00.000Z',
  updatedAt: '2024-03-16T00:00:00.000Z',
};

export const iframeViewerTask = {
  name: 'iframeViewer task',
  type: 'iframeViewer',
  config: {
    link: 'https://google.com',
  },
};

export const schulteTableTask = {
  name: 'schulte task',
  type: 'schulteTable',
  config: {
    x: 2,
    y: 5,
    reverse: false,
  },
};

export const lettersToSyllableTask = {
  name: 'letters to syllable',
  type: 'lettersToSyllable',
  config: {
    list: [{ first: 'a', last: 'b', vowelColor: 'red' }],
  },
};

export const findFlashingNumberTask = {
  name: 'find flashing number',
  type: 'findFlashingNumber',
  config: {
    duration: 60,
    streak: { length: 15 },
    animation: {
      min: 700,
      max: 1000,
    },
    positionalDigit: {
      min: 2,
      max: 4,
    },
    y: {
      min: 3,
      max: 6,
    },
    x: {
      min: 4,
      max: 5,
    },
  },
};

export const goneAndFoundTask = {
  name: 'gone and found task',
  type: 'goneAndFound',
  config: {
    preset: 'default',
    streak: { length: 10 },
    items: {
      min: 3,
      max: 11,
    },
    limit: {
      type: 'rounds',
      value: 10,
    },
    y: {
      min: 3,
      max: 5,
    },
  },
};

export const tasks = [
  {
    name: 'Task 1',
    type: 'imageSlider',
    hash: '11111111',
    config: {
      slides: [
        {
          image: {
            id: 1,
          },
        },
      ],
      title: 'Hello',
    },
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
  },
  {
    name: 'Task 2',
    type: 'imageSlider',
    hash: '22222222',
    config: {
      slides: [
        {
          image: {
            id: 2,
          },
        },
      ],
      title: 'Hello2',
    },
    createdAt: '2024-03-11T00:00:00.000Z',
    updatedAt: '2024-03-11T00:00:00.000Z',
  },
  {
    name: 'Task 3',
    type: 'imageSlider',
    hash: '33333333',
    config: {
      slides: [
        {
          image: {
            id: 3,
          },
        },
      ],
      title: 'Hello3',
    },
    createdAt: '2024-03-12T00:00:00.000Z',
    updatedAt: '2024-03-12T00:00:00.000Z',
  },
  {
    name: 'Task 4',
    type: 'imageSlider',
    hash: '44444444',
    config: {
      slides: [
        {
          image: {
            id: 4,
          },
        },
      ],
      title: 'Hello4',
    },
    createdAt: '2024-03-13T00:00:00.000Z',
    updatedAt: '2024-03-13T00:00:00.000Z',
  },
  {
    name: 'Task 5',
    type: 'semaphoreText',
    hash: '55555555',
    config: {
      colors: ['red'],
      delayRange: [1, 2],
      text: ['a'],
    },
    createdAt: '2024-03-14T00:00:00.000Z',
    updatedAt: '2024-03-14T00:00:00.000Z',
  },
  {
    name: 'Task 6',
    type: 'semaphoreText',
    hash: '66666666',
    config: {
      colors: ['green'],
      delayRange: [2, 3],
      text: ['b'],
    },
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z',
  },
  {
    name: 'Task 7',
    type: 'semaphoreText',
    hash: '77777777',
    config: {
      colors: ['yellow'],
      delayRange: [3, 4],
      text: ['c'],
    },
    createdAt: '2024-03-16T00:00:00.000Z',
    updatedAt: '2024-03-16T00:00:00.000Z',
  },
  {
    name: 'Task 8',
    type: 'semaphoreText',
    hash: '88888888',
    config: {
      colors: ['brown'],
      delayRange: [4, 5],
      text: ['d'],
    },
    createdAt: '2024-03-17T00:00:00.000Z',
    updatedAt: '2024-03-17T00:00:00.000Z',
  },
];
