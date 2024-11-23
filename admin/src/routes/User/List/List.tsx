import { useMemo, useState } from 'react';
import { defaultUserListFilters, makeUsersStore } from '@/stores/user';
import { CreateUserDrawer } from '@/components/CreateUserDrawer';
import { UserTable } from '@/components/UserTable';
import { createListFilters } from '@/stores/_list-filter';

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
    <>
      <CreateUserDrawer />

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
    </>
  );
}
