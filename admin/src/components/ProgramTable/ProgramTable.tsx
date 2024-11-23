import { Table, Space, Button } from 'antd';
import type { TableProps } from 'antd';
import type { FetcherStore } from '@nanostores/query';
import type { ReadableAtom, WritableAtom } from 'nanostores';
import { useStore } from '@nanostores/react';

import { formatDate } from '@/utils/date';
import { ROUTES } from '@/stores/router';
import { Filters } from '@/components/Filters';
import type { TFilters } from '@/components/Filters/types';
import type { IProgram } from '@/types/program';
import type { IPaginatorResponse } from '@/types';
import type { IProgramListFilters } from '@/stores/program';
import { UpdateProgramDrawer } from '../UpdateProgramDrawer';

// TODO move it to separate file to make them pickable
// to compose custom filter options
const filtersConfig: Array<TFilters> = [
  {
    type: 'search-string',
    label: 'Name',
    name: 'name',
    placeholder: 'Program Veronika',
  },
  // TODO: add user id search
  {
    type: 'date-range',
    minName: 'min_start_datetime',
    maxName: 'max_start_datetime',
    label: 'Start datetime range',
  },
  {
    type: 'date-range',
    minName: 'min_expiration_datetime',
    maxName: 'max_expiration_datetime',
    label: 'Expiration datetime range',
  },
  {
    type: 'date-range',
    minName: 'min_updated_at',
    maxName: 'max_updated_at',
    label: 'Updating range',
  },
  {
    type: 'date-range',
    minName: 'min_created_at',
    maxName: 'max_created_at',
    label: 'Creation range',
  },
];

interface IProps {
  defaultFilters: IProgramListFilters;
  $programs: FetcherStore<IPaginatorResponse<IProgram>>;
  $filters: WritableAtom<IProgramListFilters>;
  $pageSize: WritableAtom<number>;
  $activeFilterCount: ReadableAtom<number>;
  setPageSize(v: number): void;
  setListFilter(k: string, v: unknown): void;
  resetListFilter(): void;
}

export function ProgramTable({
  defaultFilters,
  $programs,
  $filters,
  $pageSize,
  $activeFilterCount,
  setPageSize,
  setListFilter,
}: IProps) {
  const { data, loading } = useStore($programs);
  const filters = useStore($filters);
  const pageSize = useStore($pageSize);
  const activeFilterCount = useStore($activeFilterCount);

  const totalPages = data?.total || 0;

  const columns: TableProps<IProgram>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      render(id) {
        return (
          <UpdateProgramDrawer
            programId={id}
            children={<Button type="link">{id}</Button>}
          />
        );
      },
    },
    {
      title: 'User',
      dataIndex: 'userId',
      render(id) {
        return <a href={ROUTES.userView(id)}>{id}</a>;
      },
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
      title: 'Start date',
      dataIndex: 'startDatetime',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'startDatetime' ? filters.dir : null,
    },
    {
      title: 'Expiration date',
      dataIndex: 'expirationDatetime',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'expirationDatetime' ? filters.dir : null,
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
