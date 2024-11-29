export const programCreateBodySchema = {
  title: 'ProgramCreateBody',
  type: 'object',
  properties: {
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
  },
  required: ['name', 'userId', 'startDatetime', 'expirationDatetime'],
  additionalProperties: false,
};
