import type { TTaskType } from '@/types/task';
import type { SelectProps } from 'antd';

export const taskTypeOptions: SelectProps<
  TTaskType,
  { label: TTaskType; value: TTaskType }
>['options'] = [
  { label: 'semaphoreText', value: 'semaphoreText' },
  { label: 'imageSlider', value: 'imageSlider' },
];
