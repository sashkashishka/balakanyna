import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Space } from 'antd';

import { createListFilters } from '@/stores/_list-filter';
import { $router } from '@/stores/router';
import { defaultTaskListFilters, makeTasksStore } from '@/stores/task';
import { TaskTable } from '@/components/TaskTable';
import * as filters from '@/components/TaskTable/constants';
import type { TFilters } from '@/components/Filters/types';
import {
  getCreatedAtFilter,
  getUpdatedAtFilter,
  getUserSelectorFilter,
} from '@/components/Filters/constants';

const filtersConfig: TFilters[] = [
  filters.name,
  filters.label,
  filters.taskType,
  getUserSelectorFilter({
    disabled: true,
  }),
  getCreatedAtFilter(),
  getUpdatedAtFilter(),
];

export function UserTasks() {
  const { params } = useStore($router)!;
  const defaultFilters = useMemo(() => {
    return {
      ...defaultTaskListFilters,
      // @ts-expect-error uid does exist
      userIds: [params.uid],
    };
  }, []);
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
      <TaskTable
        filtersConfig={filtersConfig}
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
