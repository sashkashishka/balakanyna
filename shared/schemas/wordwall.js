export const wordwallSchema = {
  title: 'WordwallTaskConfig',
  type: 'object',
  properties: {
    link: {
      type: 'string',
    },
  },
  required: ['link'],
  additionalProperties: false,
};
