import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Flex, Space } from 'antd';

import { createListFilters } from '@/stores/_list-filter';
import { $router } from '@/stores/router';
import { defaultProgramListFilters, makeProgramsStore } from '@/stores/program';
import { ProgramTable } from '@/components/ProgramTable';
import { CreateProgramDrawer } from '@/components/CreateProgramDrawer';

export function UserPrograms() {
  const { params } = useStore($router)!;
  const defaultFilters = useMemo(() => {
    return {
      ...defaultProgramListFilters,
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
  const [$programs] = useState(() => makeProgramsStore($filtersSearchParams));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="end">
        <CreateProgramDrawer
          initialValues={{
            // @ts-expect-error uid does exist
            userId: Number(params.uid),
          }}
        />
      </Flex>

      <ProgramTable
        defaultFilters={defaultFilters}
        $programs={$programs}
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