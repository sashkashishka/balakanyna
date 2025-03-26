import { getAjv } from '@/utils/json';
import type { ValidateFunction } from 'ajv';

import type { TTaskType } from 'shared/types/task';
import { semaphoreTextSchema } from 'shared/schemas/semaphoreText';
import { fullImageSliderSchema } from 'shared/schemas/imageSlider';
import { wordwallSchema } from 'shared/schemas/wordwall';

const ajv = getAjv();

export const CONFIG_VALIDATOR_MAP: Record<TTaskType, ValidateFunction> = {
  semaphoreText: ajv.compile(semaphoreTextSchema),
  imageSlider: ajv.compile(fullImageSliderSchema),
  wordwall: ajv.compile(wordwallSchema),
};
