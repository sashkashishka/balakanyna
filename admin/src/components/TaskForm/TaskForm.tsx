import { useStore } from '@nanostores/react';
import { Col, Flex, Form, notification, Row } from 'antd';

import { type TTaskType, type TTask } from 'shared/types/task';
import { $createTask, $updateTask } from '@/stores/task';

import { SemaphoreTextConfigForm } from './tasks/SemaphoreTextConfigForm';
import { ImageSliderConfigForm } from './tasks/ImageSliderConfigForm';
import { useMemo, useState } from 'react';
import { TaskPreview } from '../TaskPreview';

export interface ITaskFormProps {
  taskType: TTaskType;
  action: 'update' | 'create';
  initialValues?: Partial<TTask>;
  onSuccess?(p: TTask): void;
  onDuplicate?(id: number): void;
}

export function TaskForm({
  taskType,
  action,
  initialValues,
  onSuccess,
  onDuplicate,
}: ITaskFormProps) {
  const { mutate: createTask } = useStore($createTask);
  const { mutate: updateTask } = useStore($updateTask);

  const isCreate = action === 'create';

  async function onFinish(data: TTask) {
    try {
      const mutate = isCreate ? createTask : updateTask;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp = (await mutate(data as any)) as Response;
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
        let message = respData.message;

        if (respData.error === 'DUPLICATE_TASK') {
          message =
            'Duplicate task. Check out the table and see the existing one with the same config';
          onDuplicate?.(Number(respData.message));
        }

        notification.error({ message });
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
      return (
        <ImageSliderConfigForm
          action={action}
          onFinish={onFinish}
          initialValues={
            initialValues as Partial<Extract<TTask, { type: 'imageSlider' }>>
          }
        />
      );
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
