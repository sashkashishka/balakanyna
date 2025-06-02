export const tasks = [
  'imageSlider',
  'semaphoreText',
  'iframeViewer',
  'schulteTable',
  'lettersToSyllable',
];

export const uploadImageSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};

export const fullImageSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    path: {
      type: 'string',
    },
    hashsum: {
      type: 'string',
    },
    filename: {
      type: 'string',
    },
  },
  required: ['id', 'path', 'hashsum', 'filename'],
  additionalProperties: false,
};
