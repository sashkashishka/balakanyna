import { createError } from '../../../../../core/errors.js';
import {
  uploadImageSliderSchema,
  fullImageSliderSchema,
} from 'shared/schemas/imageSlider.js';
import { semaphoreTextSchema } from 'shared/schemas/semaphoreText.js';
import { iframeViewerSchema } from 'shared/schemas/iframeViewer.js';
import { schulteTableSchema } from 'shared/schemas/schulteTable.js';
import { lettersToSyllableSchema } from 'shared/schemas/lettersToSyllable.js';
import { findFlashingNumberSchema } from 'shared/schemas/findFlashingNumber.js';
import { goneAndFoundSchema } from 'shared/schemas/goneAndFound.js';
import {
  uploadBrainboxSchema,
  fullBrainboxSchema,
} from 'shared/schemas/brainbox.js';

export const uploadTypeToSchema = {
  imageSlider: uploadImageSliderSchema,
  semaphoreText: semaphoreTextSchema,
  iframeViewer: iframeViewerSchema,
  schulteTable: schulteTableSchema,
  lettersToSyllable: lettersToSyllableSchema,
  findFlashingNumber: findFlashingNumberSchema,
  goneAndFound: goneAndFoundSchema,
  brainbox: uploadBrainboxSchema,
};

export const fullTypeToSchema = {
  imageSlider: fullImageSliderSchema,
  semaphoreText: semaphoreTextSchema,
  iframeViewer: iframeViewerSchema,
  schulteTable: schulteTableSchema,
  lettersToSyllable: lettersToSyllableSchema,
  findFlashingNumber: findFlashingNumberSchema,
  goneAndFound: goneAndFoundSchema,
  brainbox: fullBrainboxSchema,
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
