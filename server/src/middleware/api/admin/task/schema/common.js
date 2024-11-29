export const imageSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
