import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import {
  defaultTaskListFilters,
  makeTasksStore,
  type ITaskListFilters,
} from '@/stores/task';
import { TaskTable } from '@/components/TaskTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateTaskDrawer } from '@/components/CreateTaskDrawer';
import type { TTask } from 'shared/types/task';

const { Paragraph } = Typography;

interface IProps {
  filters?: Partial<ITaskListFilters>;
  setSelected(v: TTask[]): void;
}

export function TaskSelectDrawerContent({ filters, setSelected }: IProps) {
  const defaultFilters = useMemo(
    () => ({
      ...defaultTaskListFilters,
      ...filters,
    }),
    [],
  );
  const [
    {
      $pageSize,
      $filters,
      $filtersSearchParams,
      $activeFilterCount,
      setPageSize,
      setListFilter,
      resetListFilter,
    },
  ] = useState(() =>
    createListFilters(defaultFilters, { syncSearchParams: false }),
  );
  const [$tasks] = useState(() => makeTasksStore($filtersSearchParams));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Paragraph strong>Task list</Paragraph>
        <CreateTaskDrawer />
      </Flex>

      <TaskTable
        defaultFilters={defaultFilters}
        $tasks={$tasks}
        $filters={$filters}
        $pageSize={$pageSize}
        $activeFilterCount={$activeFilterCount}
        setPageSize={setPageSize}
        setListFilter={setListFilter}
        resetListFilter={resetListFilter}
        rowSelection={{
          type: 'checkbox',
          onChange(_ids, records) {
            setSelected(records);
          },
        }}
      />
    </Space>
  );
}
