export const taskDeleteSearchParamsSchema = {
  title: 'TaskDeleteSearchParams',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
