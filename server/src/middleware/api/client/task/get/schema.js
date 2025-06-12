export const clientTaskGetSearchParamsSchema = {
  title: 'ClientTaskGetSearchParams',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
