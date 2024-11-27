import { Table, Space, Button, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { FetcherStore } from '@nanostores/query';
import type { ReadableAtom, WritableAtom } from 'nanostores';
import { useStore } from '@nanostores/react';

import { formatDate } from '@/utils/date';
import { Filters } from '@/components/Filters';
import type { TFilters } from '@/components/Filters/types';
import type { TTask } from '@/types/task';
import type { ILabel } from '@/types/label';
import type { IPaginatorResponse } from '@/types';
import type { ITaskListFilters } from '@/stores/task';
import { UpdateTaskDrawer } from '../UpdateTaskDrawer';

import { filtersConfig as defaultFiltersConfig } from './constants';

interface IProps {
  filtersConfig?: TFilters[];
  defaultFilters: ITaskListFilters;
  $tasks: FetcherStore<IPaginatorResponse<TTask>>;
  $filters: WritableAtom<ITaskListFilters>;
  $pageSize: WritableAtom<number>;
  $activeFilterCount: ReadableAtom<number>;
  setPageSize(v: number): void;
  setListFilter(k: string, v: unknown): void;
  resetListFilter(): void;
}

export function TaskTable({
  defaultFilters,
  $tasks,
  $filters,
  $pageSize,
  $activeFilterCount,
  setPageSize,
  setListFilter,
  filtersConfig = defaultFiltersConfig,
}: IProps) {
  const { data, loading } = useStore($tasks);
  const filters = useStore($filters);
  const pageSize = useStore($pageSize);
  const activeFilterCount = useStore($activeFilterCount);

  const totalPages = data?.total || 0;

  const columns: TableProps<TTask>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      render(id) {
        return (
          <UpdateTaskDrawer
            taskId={id}
            children={<Button type="link">{id}</Button>}
          />
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'type' ? filters.dir : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render(_id, record) {
        return <Space direction="vertical">{record.name}</Space>;
      },
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'name' ? filters.dir : null,
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      render(labels: ILabel[]) {
        return (
          <Space wrap>
            {labels.map((item, i) => (
              <Tag
                key={`${item.name}${i}`}
                color={item.config.color}
                bordered={item.config.bordered}
              >
                {item.name}
              </Tag>
            ))}
          </Space>
        );
      },
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

