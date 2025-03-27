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

export const wordwallTask = {
  name: 'wordwall task',
  type: 'wordwall',
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

export const tasks = [
  {
    name: 'Task 1',
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
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
  },
  {
    name: 'Task 2',
    type: 'imageSlider',
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
    config: {
      colors: ['brown'],
      delayRange: [4, 5],
      text: ['d'],
    },
    createdAt: '2024-03-17T00:00:00.000Z',
    updatedAt: '2024-03-17T00:00:00.000Z',
  },
];
