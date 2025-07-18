import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import {
  defaultImageListFilters,
  makeImagesStore,
  type IImageListFilters,
} from '@/stores/image';
import { ImageTable } from '@/components/ImageTable';
import { createListFilters } from '@/stores/_list-filter';
import { CreateImageDrawer } from '@/components/CreateImageDrawer';
import type { IImage } from 'shared/types/image';

const { Paragraph } = Typography;

interface IProps {
  multipleSelect?: boolean;
  filters?: Partial<IImageListFilters>;
  setSelected(v: IImage[]): void;
}

export function ImageSelectDrawerContent({
  multipleSelect,
  filters,
  setSelected,
}: IProps) {
  const defaultFilters = useMemo(
    () => ({
      ...defaultImageListFilters,
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
        rowSelection={{
          type: multipleSelect ? 'checkbox' : 'radio',
          onChange(_ids, records) {
            setSelected(records);
          },
        }}
      />
    </Space>
  );
}
