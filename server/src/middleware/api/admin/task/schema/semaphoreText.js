export const semaphoreTextSchema = {
  title: 'SemaphoreTextTaskConfig',
  type: 'object',
  properties: {
    colors: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    text: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    delayRange: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 0,
      },
      minItems: 2,
      maxItems: 2,
    },
  },
  required: ['colors', 'text', 'delayRange'],
  additionalProperties: false,
};
