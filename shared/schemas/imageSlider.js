import { fullImageSchema, uploadImageSchema } from './common.js';

export const uploadImageSliderSchema = {
  title: 'UploadImageSliderTaskConfig',
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
          image: uploadImageSchema,
        },
        required: ['image'],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ['title', 'slides'],
  additionalProperties: false,
};

export const fullImageSliderSchema = {
  title: 'FullImageSliderTaskConfig',
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
          image: fullImageSchema,
        },
        required: ['image'],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ['title', 'slides'],
  additionalProperties: false,
};
