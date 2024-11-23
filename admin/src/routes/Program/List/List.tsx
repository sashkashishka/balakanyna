import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { defaultProgramListFilters, makeProgramsStore } from '@/stores/program';
import { ProgramTable } from '@/components/ProgramTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateProgramDrawer } from '@/components/CreateProgramDrawer';

const { Paragraph } = Typography;

export function ProgramListPage() {
  const defaultFilters = useMemo(() => defaultProgramListFilters, []);
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
      <Flex justify="space-between">
        <Paragraph strong>Program list</Paragraph>
        <CreateProgramDrawer />
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
