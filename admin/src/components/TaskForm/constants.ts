import type { SelectProps } from 'antd';

import type { TTaskType } from 'shared/schemas/common';
import type { TTaskType } from 'shared/types/task';

export const taskTypeOptions: SelectProps<
  TTaskType,
  { label: TTaskType; value: TTaskType }
>['options'] = tasks.map(task => ({ label: task, value: task }));
