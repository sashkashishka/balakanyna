export const goneAndFoundSchema = {
  title: 'GoneAndFoundTaskConfig',
  type: 'object',
  properties: {
    preset: {
      type: 'string',
      enum: ['default'],
    },
    items: {
      description: 'number of items to find',
      type: 'object',
      properties: {
        min: {
          type: 'number',
          minimum: 1,
          maximum: 11,
        },
        max: {
          type: 'number',
          minimum: 1,
          maximum: 11,
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
    limit: {
      description: 'type of game limit - timer or rounds',
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['timer', 'rounds'],
        },
        value: {
          type: 'number',
          minimum: 1,
        },
      },
      required: ['type', 'value'],
      additionalProperties: false,
    },
    y: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
          minimum: 3,
          maximum: 5,
        },
        max: {
          type: 'number',
          minimum: 3,
          maximum: 5,
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
  },
  required: ['preset', 'y', 'items', 'limit'],
  additionalProperties: false,
};
