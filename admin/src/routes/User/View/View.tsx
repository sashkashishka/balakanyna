import { $router, openRoute, ROUTE_ALIAS } from '@/stores/router';
import { useStore } from '@nanostores/react';
import { Tabs } from 'antd';
import { UserInfo } from './Info';

const tabs = [
  {
    key: ROUTE_ALIAS.USER_VIEW,
    label: 'Info',
    children: <UserInfo />,
  },
  {
    key: ROUTE_ALIAS.USER_VIEW_PROGRAMS,
    label: 'Programs',
    children: 'user program',
  },
  {
    key: ROUTE_ALIAS.USER_VIEW_TASKS,
    label: 'Tasks',
    children: 'user task',
  },
];

export function UserViewPage() {
  const { route, params } = useStore($router)!;

  const onTabChange = (key: string) => {
    // @ts-expect-error id param exists
    openRoute(key, { id: params.id });
  };

  return (
    <Tabs
      onChange={onTabChange}
      type="card"
      items={tabs}
      activeKey={String(route)}
    />
  );
}
