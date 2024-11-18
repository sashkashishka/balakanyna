export const imageSliderTask = {
  name: 'slider task',
  type: 'imageSlider',
  config: {
    title: 'Hello',
    slides: [
      {
        image: {
          id: 1,
          hashsum: 'aaa',
          filename: 'foo.jpeg',
          path: 'aaa.jpeg',
        },
      },
    ],
  },
};

export const tasks = [
  {
    name: 'Task 1',
    type: 'imageSlider',
    config: {
      title: 'Hello',
      slides: [
        {
          image: {
            id: 1,
            hashsum: 'aaa',
            filename: 'foo.jpeg',
            path: 'aaa.jpeg',
          },
        },
      ],
    },
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-03-10T00:00:00.000Z',
  },
  {
    name: 'Task 2',
    type: 'imageSlider',
    config: {
      title: 'Hello2',
      slides: [
        {
          image: {
            id: 2,
            hashsum: 'bbb',
            filename: 'boo.jpeg',
            path: 'bbb.jpeg',
          },
        },
      ],
    },
    createdAt: '2024-03-11T00:00:00.000Z',
    updatedAt: '2024-03-11T00:00:00.000Z',
  },
  {
    name: 'Task 3',
    type: 'imageSlider',
    config: {
      title: 'Hello3',
      slides: [
        {
          image: {
            id: 3,
            hashsum: 'ccc',
            filename: 'boom.jpeg',
            path: 'ccc.jpeg',
          },
        },
      ],
    },
    createdAt: '2024-03-12T00:00:00.000Z',
    updatedAt: '2024-03-12T00:00:00.000Z',
  },
  {
    name: 'Task 4',
    type: 'imageSlider',
    config: {
      title: 'Hello4',
      slides: [
        {
          image: {
            id: 4,
            hashsum: 'ddd',
            filename: 'boom.jpeg',
            path: 'ddd.jpeg',
          },
        },
      ],
    },
    createdAt: '2024-03-13T00:00:00.000Z',
    updatedAt: '2024-03-13T00:00:00.000Z',
  },
  {
    name: 'Task 5',
    type: 'semaphoreText',
    config: {
      colors: ['red'],
      text: ['a'],
      delayRange: [1, 2],
    },
    createdAt: '2024-03-14T00:00:00.000Z',
    updatedAt: '2024-03-14T00:00:00.000Z',
  },
  {
    name: 'Task 6',
    type: 'semaphoreText',
    config: {
      colors: ['green'],
      text: ['b'],
      delayRange: [2, 3],
    },
    createdAt: '2024-03-15T00:00:00.000Z',
    updatedAt: '2024-03-15T00:00:00.000Z',
  },
  {
    name: 'Task 7',
    type: 'semaphoreText',
    config: {
      colors: ['yellow'],
      text: ['c'],
      delayRange: [3, 4],
    },
    createdAt: '2024-03-16T00:00:00.000Z',
    updatedAt: '2024-03-16T00:00:00.000Z',
  },
  {
    name: 'Task 8',
    type: 'semaphoreText',
    config: {
      colors: ['brown'],
      text: ['d'],
      delayRange: [4, 5],
    },
    createdAt: '2024-03-17T00:00:00.000Z',
    updatedAt: '2024-03-17T00:00:00.000Z',
  },
];
