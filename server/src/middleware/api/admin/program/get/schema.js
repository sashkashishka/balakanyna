export const programGetSearchParamsSchema = {
  title: 'ProgramGetSearchParams',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
