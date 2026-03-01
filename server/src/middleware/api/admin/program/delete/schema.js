export const programDeleteBodySchema = {
  title: 'ProgramDeleteBody',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
