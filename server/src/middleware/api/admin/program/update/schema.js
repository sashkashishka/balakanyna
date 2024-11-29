export const programUpdateBodySchema = {
  title: 'ProgramUpdateBody',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    name: {
      type: 'string',
    },
    userId: {
      type: 'integer',
    },
    startDatetime: {
      type: 'string',
      format: 'date-time',
    },
    expirationDatetime: {
      type: 'string',
      format: 'date-time',
    },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: {
            type: 'integer',
            minimum: 0,
          },
        },
        required: ['taskId'],
        additionalProperties: false,
      },
    },
  },
  required: [
    'id',
    'name',
    'userId',
    'startDatetime',
    'expirationDatetime',
    'tasks',
  ],
  additionalProperties: false,
};
