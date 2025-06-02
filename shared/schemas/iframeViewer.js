export const iframeViewerSchema = {
  title: 'IframeViewerTaskConfig',
  type: 'object',
  properties: {
    link: {
      type: 'string',
    },
  },
  required: ['link'],
  additionalProperties: false,
};
