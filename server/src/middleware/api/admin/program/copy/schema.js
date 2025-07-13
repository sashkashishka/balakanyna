export const programCopyBodySchema = {
  title: 'ProgramCopyBody',
  type: 'object',
  properties: {
    id: {
      type: 'number',
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
  required: ['id', 'userId', 'startDatetime', 'expirationDatetime'],
  additionalProperties: false,
};
