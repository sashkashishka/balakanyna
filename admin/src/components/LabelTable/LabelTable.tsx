import { Table, Button, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { FetcherStore } from '@nanostores/query';
import type { ReadableAtom, WritableAtom } from 'nanostores';
import { useStore } from '@nanostores/react';

import { formatDate } from '@/utils/date';
import { Filters } from '@/components/Filters';
import type { TFilters } from '@/components/Filters/types';
import type { ILabel } from '@/types/label';
import type { IPaginatorResponse } from '@/types';
import type { ILabelListFilters } from '@/stores/label';
import { UpdateLabelDrawer } from '../UpdateLabelDrawer';

const filtersConfig: Array<TFilters> = [
  {
    type: 'search-string',
    label: 'Name',
    name: 'name',
    placeholder: 'Label Veronika',
  },
  {
    type: 'select',
    label: 'Type',
    name: 'type',
    options: [
      { label: 'Image', value: 'image' },
      { label: 'Task', value: 'task' },
    ],
  },
];

interface IProps {
  defaultFilters: ILabelListFilters;
  $labels: FetcherStore<IPaginatorResponse<ILabel>>;
  $filters: WritableAtom<ILabelListFilters>;
  $pageSize: WritableAtom<number>;
  $activeFilterCount: ReadableAtom<number>;
  setPageSize(v: number): void;
  setListFilter(k: string, v: unknown): void;
  resetListFilter(): void;
}

export function LabelTable({
  defaultFilters,
  $labels,
  $filters,
  $pageSize,
  $activeFilterCount,
  setPageSize,
  setListFilter,
}: IProps) {
  const { data, loading } = useStore($labels);
  const filters = useStore($filters);
  const pageSize = useStore($pageSize);
  const activeFilterCount = useStore($activeFilterCount);

  const totalPages = data?.total || 0;

  const columns: TableProps<ILabel>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      render(id) {
        return (
          <UpdateLabelDrawer
            labelId={id}
            children={<Button type="link">{id}</Button>}
          />
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render(name, { config }) {
        return (
          <Tag bordered={config.bordered} color={config.color}>
            {name}
          </Tag>
        );
      },
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'name' ? filters.dir : null,
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
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