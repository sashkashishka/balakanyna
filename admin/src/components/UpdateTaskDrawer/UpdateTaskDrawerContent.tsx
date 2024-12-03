import { useStore } from '@nanostores/react';
import type { FetcherStore } from '@nanostores/query';
import { Flex, Space, Spin } from 'antd';

import type { TTask } from 'shared/types/task';

import { TaskForm } from '../TaskForm';
import { LinkLabelForm } from '../LinkLabelForm';

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
    <Space direction="vertical">
      <LinkLabelForm
        type="task"
        entityId={data.id}
        initialLabels={data.labels}
      />

      <TaskForm taskType={data.type} action="update" initialValues={data} />
    </Space>
  );
}
