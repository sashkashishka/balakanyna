import { Flex, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { defaultUserListFilters, makeUsersStore } from '@/stores/user';
import { CreateUserDrawer } from '@/components/CreateUserDrawer';
import { UserTable } from '@/components/UserTable';
import { createListFilters } from '@/stores/_list-filter';

const { Paragraph } = Typography;

export function UserListPage() {
  const defaultFilters = useMemo(() => defaultUserListFilters, []);
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
  const [$users] = useState(() => makeUsersStore($filtersSearchParams));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Paragraph strong>User list</Paragraph>
        <CreateUserDrawer />
      </Flex>

      <UserTable
        defaultFilters={defaultFilters}
        $users={$users}
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
