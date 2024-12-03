import { Table, Space } from 'antd';
import type { TableProps } from 'antd';
import { useStore } from '@nanostores/react';

import type { IUser } from 'shared/types/user';
import { type IUserListFilters } from '@/stores/user';
import { formatDate } from '@/utils/date';
import { ROUTES } from '@/stores/router';
import { Filters } from '@/components/Filters';
import type { FetcherStore } from '@nanostores/query';
import type { IPaginatorResponse } from 'shared/types';
import type { ReadableAtom, WritableAtom } from 'nanostores';

import { filtersConfig } from '../ProgramTable/constants';

interface IProps {
  defaultFilters: IUserListFilters;
  $users: FetcherStore<IPaginatorResponse<IUser>>;
  $filters: WritableAtom<IUserListFilters>;
  $pageSize: WritableAtom<number>;
  $activeFilterCount: ReadableAtom<number>;
  setPageSize(v: number): void;
  setListFilter(k: string, v: unknown): void;
  resetListFilter(): void;
  rowSelection?: TableProps<IUser>['rowSelection'];
}

export function UserTable({
  defaultFilters,
  $users,
  $filters,
  $pageSize,
  $activeFilterCount,
  setPageSize,
  setListFilter,
  resetListFilter,
  rowSelection,
}: IProps) {
  const { data, loading } = useStore($users);
  const filters = useStore($filters);
  const pageSize = useStore($pageSize);
  const activeFilterCount = useStore($activeFilterCount);

  const totalPages = data?.total || 0;

  const columns: TableProps<IUser>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      render(id: string) {
        return <a href={ROUTES.userView(id)}>{id}</a>;
      },
    },
    {
      title: 'Name Surname',
      dataIndex: 'name',
      render(_id, record) {
        return (
          <Space direction="vertical">
            {record.name}
            {record.surname}
          </Space>
        );
      },
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'name' ? filters.dir : null,
    },
    {
      title: 'Birth date',
      dataIndex: 'birthdate',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'birthdate' ? filters.dir : null,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'grade' ? filters.dir : null,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: formatDate,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      sortOrder: filters.order_by === 'createdAt' ? filters.dir : null,
    },
  ];

  return (
    <>
      <Filters
        values={filters}
        onChange={setListFilter}
        activeCount={activeFilterCount}
        config={filtersConfig}
        resetFilter={resetListFilter}
        pagination={{ name: 'page' }}
      />

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        rowSelection={rowSelection}
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
