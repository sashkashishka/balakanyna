import type { SelectProps } from 'antd';

import { tasks } from 'shared/schemas/common';
import type { TTaskType } from 'shared/types/task';

export const taskTypeOptions: SelectProps<
  TTaskType,
  { label: TTaskType; value: TTaskType }
>['options'] = (tasks as TTaskType[]).map((task) => ({
  label: task,
  value: task,
}));
