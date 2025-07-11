import { uploadImageSchema, fullImageSchema } from './common.js';

export const uploadBrainboxSchema = {
  title: 'BrainboxTaskConfig',
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: uploadImageSchema,
          back: uploadImageSchema,
        },
        required: ['front', 'back'],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ['items'],
  additionalProperties: false,
};

export const fullBrainboxSchema = {
  title: 'BrainboxTaskConfig',
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: fullImageSchema,
          back: fullImageSchema,
        },
        required: ['front', 'back'],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ['items'],
  additionalProperties: false,
};
