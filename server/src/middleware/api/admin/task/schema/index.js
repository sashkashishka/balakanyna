import { createError } from '../../../../../core/errors.js';
import {
  uploadImageSliderSchema,
  fullImageSliderSchema,
} from 'shared/schemas/imageSlider.js';
import { semaphoreTextSchema } from 'shared/schemas/semaphoreText.js';
import { iframeViewerSchema } from 'shared/schemas/iframeViewer.js';
import { schulteTableSchema } from 'shared/schemas/schulteTable.js';
import { lettersToSyllableSchema } from 'shared/schemas/lettersToSyllable.js';

export const uploadTypeToSchema = {
  imageSlider: uploadImageSliderSchema,
  semaphoreText: semaphoreTextSchema,
  iframeViewer: iframeViewerSchema,
  schulteTable: schulteTableSchema,
  lettersToSyllable: lettersToSyllableSchema,
};

export const fullTypeToSchema = {
  imageSlider: fullImageSliderSchema,
  semaphoreText: semaphoreTextSchema,
  iframeViewer: iframeViewerSchema,
  schulteTable: schulteTableSchema,
  lettersToSyllable: lettersToSyllableSchema,
};

const ERR_INVALID_TASK_CONFIG = createError(
  'INVALID_TASK_CONFIG',
  'Invalid task config for %s',
  400,
);

export function getTaskConfigValidator(ajv, type, isUpload = true) {
  return ajv.compile(
    isUpload ? uploadTypeToSchema[type] : fullTypeToSchema[type],
  );
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
