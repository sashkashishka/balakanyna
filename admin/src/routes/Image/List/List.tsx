import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { defaultImageListFilters, makeImagesStore } from '@/stores/image';
import { ImageTable } from '@/components/ImageTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateImageDrawer } from '@/components/CreateImageDrawer';

const { Paragraph } = Typography;

export function ImageListPage() {
  const defaultFilters = useMemo(() => defaultImageListFilters, []);
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
  const [$images] = useState(() => makeImagesStore($filtersSearchParams));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Paragraph strong>Image list</Paragraph>
        <CreateImageDrawer />
      </Flex>

      <ImageTable
        defaultFilters={defaultFilters}
        $images={$images}
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
