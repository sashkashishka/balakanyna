import { Table, Button, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { FetcherStore } from '@nanostores/query';
import type { ReadableAtom, WritableAtom } from 'nanostores';
import { useStore } from '@nanostores/react';

import { formatDate } from '@/utils/date';
import { Filters } from '@/components/Filters';
import type { TFilters } from '@/components/Filters/types';
import type { IImage } from '@/types/image';
import type { IPaginatorResponse } from '@/types';
import type { IImageListFilters } from '@/stores/image';
import { UpdateImageDrawer } from '../UpdateImageDrawer';

import { filtersConfig as defaultFiltersConfig } from './constants';

interface IProps {
  defaultFilters: IImageListFilters;
  $images: FetcherStore<IPaginatorResponse<IImage>>;
  $filters: WritableAtom<IImageListFilters>;
  $pageSize: WritableAtom<number>;
  $activeFilterCount: ReadableAtom<number>;
  setPageSize(v: number): void;
  setListFilter(k: string, v: unknown): void;
  resetListFilter(): void;
  filtersConfig?: Array<TFilters>;
}

export function ImageTable({
  defaultFilters,
  $images,
  $filters,
  $pageSize,
  $activeFilterCount,
  setPageSize,
  setListFilter,
  filtersConfig = defaultFiltersConfig,
}: IProps) {
  const { data, loading } = useStore($images);
  const filters = useStore($filters);
  const pageSize = useStore($pageSize);
  const activeFilterCount = useStore($activeFilterCount);

  const totalPages = data?.total || 0;

  const columns: TableProps<IImage>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      render(id) {
        return (
          <UpdateImageDrawer
            imageId={id}
            children={<Button type="link">{id}</Button>}
          />
        );
      },
    },
    // {
    //   title: 'Name',
    //   dataIndex: 'name',
    //   render(name, { config }) {
    //     return (
    //       <Tag bordered={config.bordered} color={config.color}>
    //         {name}
    //       </Tag>
    //     );
    //   },
    //   sorter: true,
    //   sortDirections: ['descend', 'ascend'],
    //   sortOrder: filters.order_by === 'name' ? filters.dir : null,
    // },
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    // },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'createdAt' ? filters.dir : null,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'updatedAt' ? filters.dir : null,
    },
  ];

  return (
    <>
      <Filters
        values={filters}
        onChange={setListFilter}
        activeCount={activeFilterCount}
        config={filtersConfig}
        pagination={{ name: 'page' }}
      />

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data?.items || []}
        pagination={{
          current: filters.page,
          onShowSizeChange(_curr, size) {
            setPageSize(size);
          },
          onChange: (newPage) => {
            setListFilter('page', newPage);
          },
          pageSize,
          total: totalPages,
        }}
        onChange={(_pagination, _filters, sorter) => {
          if (Array.isArray(sorter)) return;

          if (sorter) {
            setListFilter(
              'order_by',
              (sorter.field as string) || defaultFilters.order_by,
            );
            setListFilter('dir', sorter.order! || defaultFilters.dir);
          }
        }}
      />
    </>
  );
}