import { Table, Space } from 'antd';
import type { TableProps } from 'antd';

import { useStore } from '@nanostores/react';

import type { IUser } from '@/types/user';
import {
  $filters,
  $activeFilterCount,
  $pageSize,
  $users,
  setListFilter,
  defaultUserListFilters,
  setPageSize,
} from '@/stores/user';
import { formatDate } from '@/utils/date';
import { ROUTES } from '@/stores/router';
import { Filters } from '@/components/Filters';
import type { TFilters } from '@/components/Filters/types';
import { CreateUserDrawer } from '@/components/CreateUserDrawer';

const filtersConfig: Array<TFilters> = [
  {
    type: 'search-string',
    label: 'Name',
    name: 'name',
    placeholder: 'Veronika',
  },
  {
    type: 'search-string',
    label: 'Surname',
    name: 'surname',
    placeholder: 'Balakhonova',
  },
  {
    type: 'date-range',
    minName: 'min_birthdate',
    maxName: 'max_birthdate',
    label: 'Birthdate range',
  },
  {
    type: 'date-range',
    minName: 'min_created_at',
    maxName: 'max_created_at',
    label: 'Creation range',
  },
  {
    type: 'number-range',
    minName: 'min_grade',
    maxName: 'max_grade',
    label: 'Grade range',
  },
];

export function UserListPage() {
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
      <CreateUserDrawer />

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
              (sorter.field as string) || defaultUserListFilters.order_by,
            );
            setListFilter('dir', sorter.order! || defaultUserListFilters.dir);
          }
        }}
      />
    </>
  );
}
