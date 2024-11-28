import { imageSchema } from './common.js';

export const imageSliderSchema = {
  title: 'ImageSliderTaskConfig',
  type: 'object',
  properties: {
    title: {
      type: 'string',
    },
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image: imageSchema,
        },
        required: ['image'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'slides'],
  additionalProperties: false,
};
