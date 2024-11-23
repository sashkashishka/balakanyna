import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { defaultLabelListFilters, makeLabelsStore } from '@/stores/label';
import { LabelTable } from '@/components/LabelTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateLabelDrawer } from '@/components/CreateLabelDrawer';

const { Paragraph } = Typography;

export function LabelListPage() {
  const defaultFilters = useMemo(() => defaultLabelListFilters, []);
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
  const [$labels] = useState(() => makeLabelsStore($filtersSearchParams));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Paragraph strong>Label list</Paragraph>
        <CreateLabelDrawer />
      </Flex>

      <LabelTable
        defaultFilters={defaultFilters}
        $labels={$labels}
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
