export const taskCreateBodySchema = {
  title: 'TaskCreateBody',
  type: 'object',
  properties: {
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
  required: ['name', 'type', 'config'],
  additionalProperties: false,
};
