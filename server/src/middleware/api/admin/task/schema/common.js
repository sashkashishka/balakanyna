export const imageSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    hashsum: {
      type: 'string',
    },
    filename: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
  },
  required: ['id', 'hashsum', 'filename', 'path'],
  additionalProperties: false,
};
