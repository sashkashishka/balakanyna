export const taskListSearchParamsSchema = {
  title: 'TaskListSearchParams',
  type: 'object',
  properties: {
    order_by: {
      type: 'string',
      enum: ['createdAt', 'updatedAt', 'type', 'name', 'id'],
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
    programIds: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    types: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    labels: {
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
