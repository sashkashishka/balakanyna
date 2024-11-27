import { useStore } from '@nanostores/react';
import { notification } from 'antd';

import { type TTaskType, type TTask } from '@/types/task';
import { $createTask, $updateTask } from '@/stores/task';

import { SemaphoreTextConfigForm } from './tasks/SemaphoreTextConfigForm';

export interface ITaskFormProps {
  taskType: TTaskType;
  action: 'update' | 'create';
  initialValues?: Partial<TTask>;
  onSuccess?(p: TTask): void;
}

export function TaskForm({
  taskType,
  action,
  initialValues,
  onSuccess,
}: ITaskFormProps) {
  const { mutate: createTask } = useStore($createTask);
  const { mutate: updateTask } = useStore($updateTask);

  const isCreate = action === 'create';

  async function onFinish(data: TTask) {
    try {
      const mutate = isCreate ? createTask : updateTask;

      const resp = (await mutate(data)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = 'id' in respData ? 'Task updated' : 'Task created';
        notification.success({ message });

        if (isCreate) {
          onSuccess?.(respData);
        }

        return true;
      }

      if ('error' in respData && typeof respData.message === 'string') {
        notification.error({ message: respData.message });
        return false;
      }

      throw respData;
    } catch (e) {
      console.error(e);
      notification.error({ message: 'Unexpected error' });
      return false;
    }
  }

  // TODO add preview to the form

  switch (taskType) {
    case 'imageSlider': {
      return null;
    }

    case 'semaphoreText': {
      return (
        <SemaphoreTextConfigForm
          action={action}
          onFinish={onFinish}
          initialValues={
            initialValues as Partial<Extract<TTask, { type: 'semaphoreText' }>>
          }
        />
      );
    }

    default:
      return null;
  }
}
