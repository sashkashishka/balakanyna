export const findFlashingNumberSchema = {
  title: 'FindFlashingNumberTaskConfig',
  type: 'object',
  properties: {
    duration: {
      type: 'number',
    },
    streak: {
      type: 'object',
      properties: {
        length: {
          type: 'number',
        },
      },
      required: ['length'],
      additionalProperties: false,
    },
    animation: {
      description: 'animation duration range',
      type: 'object',
      properties: {
        min: {
          type: 'number',
        },
        max: {
          type: 'number',
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
    positionalDigit: {
      description: 'search number range',
      type: 'object',
      properties: {
        min: {
          type: 'number',
          minimum: 2,
          maximum: 4,
        },
        max: {
          type: 'number',
          minimum: 2,
          maximum: 4,
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
    y: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
        },
        max: {
          type: 'number',
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
    x: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
        },
        max: {
          type: 'number',
        },
      },
      required: ['max', 'min'],
      additionalProperties: false,
    },
  },
  required: ['x', 'y', 'streak', 'animation', 'duration', 'positionalDigit'],
  additionalProperties: false,
};
