import { Descriptions } from 'antd';
import { useStore } from '@nanostores/react';
import { $userDescriptionItems } from '@/stores/user';

export function UserInfo() {
  const items = useStore($userDescriptionItems);

  return (
    <Descriptions
      bordered
      column={{ sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
      items={items!}
    />
  );
}
