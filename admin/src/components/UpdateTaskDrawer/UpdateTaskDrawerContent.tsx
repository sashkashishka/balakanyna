import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Spin } from 'antd';

import type { TTask } from '@/types/task';

import { TaskForm } from '../TaskForm';

interface IProps {
  $task: FetcherStore<TTask>;
}

export function UpdateTaskDrawerContent({ $task }: IProps) {
  const { data, loading, error } = useStore($task);

  if (loading || error || !data) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <TaskForm
      name={`task-update-${data.id}`}
      taskType={data.type}
      action="update"
      initialValues={data}
    />
  );
}
