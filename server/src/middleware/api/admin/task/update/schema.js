export const taskUpdateBodySchema = {
  title: 'TaskUpdateBody',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['imageSlider', 'semaphoreText', 'wordwall'],
    },
    config: {
      type: 'object',
      minProperties: 1,
    },
  },
  required: ['id', 'name', 'type', 'config'],
  additionalProperties: false,
};
