import { useStore } from '@nanostores/react';
import { Flex, Space, Spin, Tabs, Typography } from 'antd';

import { $router, openRoute, ROUTE_ALIAS } from '@/stores/router';
import { $user } from '@/stores/user';
import { UpdateUserDrawer } from '@/components/UpdateUserDrawer';
import { UserInfo } from './Info';
import { UserPrograms } from './Programs';

const { Paragraph } = Typography;

const tabs = [
  {
    key: ROUTE_ALIAS.USER_VIEW,
    label: 'Info',
    children: <UserInfo />,
  },
  {
    key: ROUTE_ALIAS.USER_VIEW_PROGRAMS,
    label: 'Programs',
    children: <UserPrograms />,
  },
  {
    key: ROUTE_ALIAS.USER_VIEW_TASKS,
    label: 'Tasks',
    children: 'user task',
  },
];

export function UserViewPage() {
  const { route, params } = useStore($router)!;
  const { data: user, loading, error } = useStore($user);

  if (loading || error || !user) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Spin />
      </Flex>
    );
  }

  const onTabChange = (key: string) => {
    // @ts-expect-error id param exists
    openRoute(key, { uid: params.uid });
  };

  return (
    <Space direction="vertical" style={{ width: '100%'}}>
      <Flex justify="space-between">
        <Space>
          <Paragraph strong>
            {user.name} {user.surname}
          </Paragraph>
          <Paragraph copyable>{user.id}</Paragraph>
        </Space>

        <UpdateUserDrawer />
      </Flex>

      <Tabs
        onChange={onTabChange}
        type="card"
        items={tabs}
        activeKey={String(route)}
      />
    </Space>
  );
}
