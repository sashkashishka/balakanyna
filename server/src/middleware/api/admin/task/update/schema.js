import { tasks } from 'shared/schemas/common.js';

export const taskUpdateBodySchema = {
  title: 'TaskUpdateBody',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    name: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: tasks,
    },
    config: {
      type: 'object',
      minProperties: 1,
    },
  },
  required: ['id', 'name', 'type', 'config'],
  additionalProperties: false,
};
