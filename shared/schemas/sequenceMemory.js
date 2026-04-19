export const sequenceMemorySchema = {
  title: 'SequenceMemoryTaskConfig',
  type: 'object',
  properties: {
    width: {
      type: 'integer',
      minimum: 2,
      maximum: 10,
    },
    height: {
      type: 'integer',
      minimum: 2,
      maximum: 10,
    },
  },
  required: ['width', 'height'],
  additionalProperties: false,
};