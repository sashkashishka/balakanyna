import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { defaultTaskListFilters, makeTasksStore } from '@/stores/task';
import { TaskTable } from '@/components/TaskTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateTaskDrawer } from '@/components/CreateTaskDrawer';

const { Paragraph } = Typography;

export function TaskListPage() {
  const defaultFilters = useMemo(() => defaultTaskListFilters, []);
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
  ] = useState(() => createListFilters(defaultFilters));
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
      />
    </Space>
  );
}

