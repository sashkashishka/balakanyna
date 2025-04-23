export const lettersToSyllableSchema = {
  title: 'LettersToSyllableTaskConfig',
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          first: {
            type: 'string',
          },
          last: {
            type: 'string',
          },
          vowelColor: {
            type: 'string',
          },
        },
        required: ['first', 'last'],
        additionalProperties: false,
      },
    },
  },
  required: ['list'],
  additionalProperties: false,
};
