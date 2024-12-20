export const programListSearchParamsSchema = {
  title: 'ProgramListSearchParams',
  type: 'object',
  properties: {
    order_by: {
      type: 'string',
      enum: [
        'createdAt',
        'updatedAt',
        'startDatetime',
        'expirationDatetime',
        'name',
      ],
    },
    dir: {
      type: 'string',
      enum: ['asc', 'desc'],
    },
    min_created_at: {
      type: 'string',
    },
    max_created_at: {
      type: 'string',
    },
    min_updated_at: {
      type: 'string',
    },
    max_updated_at: {
      type: 'string',
    },
    min_start_datetime: {
      type: 'string',
    },
    max_start_datetime: {
      type: 'string',
    },
    min_expiration_datetime: {
      type: 'string',
    },
    max_expiration_datetime: {
      type: 'string',
    },
    ids: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    userIds: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    name: {
      type: 'string',
    },
  },
  required: ['order_by', 'dir'],
};
