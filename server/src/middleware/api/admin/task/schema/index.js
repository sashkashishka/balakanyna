import { createError } from '../../../../../core/errors.js';
import imageSliderSchema from './imageSlider.json' with { type: 'json' };
import semaphoreTextSchema from './semaphoreText.json' with { type: 'json' };

export const typeToSchema = {
  imageSlider: imageSliderSchema,
  semaphoreText: semaphoreTextSchema,
};

const ERR_INVALID_TASK_CONFIG = createError(
  'INVALID_TASK_CONFIG',
  'Invalid task config for %s',
  400,
);

export function getTaskConfigValidator(ajv, type) {
  return ajv.compile(typeToSchema[type]);
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
export function verifyTaskConfigSchemaMiddleware(ctx, next) {
  const body = ctx.body;

  const validator = getTaskConfigValidator(ctx.ajv, body.type);

  if (!validator(body.config)) {
    throw new ERR_INVALID_TASK_CONFIG(body.type);
  }

  return next();
}
