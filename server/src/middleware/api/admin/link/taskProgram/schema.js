export const linkTaskProgramBodySchema = {
  title: 'LinkTaskProgramBody',
  type: 'object',
  properties: {
    programId: {
      type: 'integer',
      minimum: 0,
    },
    taskId: {
      type: 'integer',
      minimum: 0,
    },
    taskOrder: {
      type: 'integer',
      minimum: 0,
    },
  },
  required: ['programId', 'taskId', 'taskOrder'],
  additionalProperties: false,
};
