export const taskGetSearchParamsSchema = {
  title: 'TaskGetSearchParams',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
