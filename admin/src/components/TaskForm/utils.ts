import { getAjv } from '@/utils/json';
import type { ValidateFunction } from 'ajv';

import type { TTaskType } from 'shared/types/task';
import { semaphoreTextSchema } from 'shared/schemas/semaphoreText';
import { fullImageSliderSchema } from 'shared/schemas/imageSlider';
import { iframeViewerSchema } from 'shared/schemas/iframeViewer';
import { schulteTableSchema } from 'shared/schemas/schulteTable';
import { lettersToSyllableSchema } from 'shared/schemas/lettersToSyllable';
import { findFlashingNumberSchema } from 'shared/schemas/findFlashingNumber';
import { goneAndFoundSchema } from 'shared/schemas/goneAndFound';
import { fullBrainboxSchema } from 'shared/schemas/brainbox';

const ajv = getAjv();

export const CONFIG_VALIDATOR_MAP: Record<TTaskType, ValidateFunction> = {
  semaphoreText: ajv.compile(semaphoreTextSchema),
  imageSlider: ajv.compile(fullImageSliderSchema),
  brainbox: ajv.compile(fullBrainboxSchema),
  iframeViewer: ajv.compile(iframeViewerSchema),
  schulteTable: ajv.compile(schulteTableSchema),
  lettersToSyllable: ajv.compile(lettersToSyllableSchema),
  findFlashingNumber: ajv.compile(findFlashingNumberSchema),
  goneAndFound: ajv.compile(goneAndFoundSchema),
};
