export const schulteTableSchema = {
  title: 'SchulteTableTaskConfig',
  type: 'object',
  properties: {
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
    reverse: {
      type: 'boolean',
    },
  },
  required: ['x', 'y', 'reverse'],
  additionalProperties: false,
};

