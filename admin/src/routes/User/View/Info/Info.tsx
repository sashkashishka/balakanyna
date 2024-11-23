import { Descriptions, type DescriptionsProps } from 'antd';

import type { IUser } from '@/types/user';
import { useMemo } from 'react';
import { formatDate } from '@/utils/date';

interface IProps {
  user: IUser;
}

export function UserInfo({ user }: IProps) {
  const items = useMemo(() => {
    return Object.keys(user || {}).reduce<DescriptionsProps['items']>(
      (acc, val, i) => {
        const key = val as keyof IUser;

        if (key === 'id') return acc;

        let children = user?.[key];

        if (key === 'birthdate') {
          children = formatDate(user[key]);
        }

        acc!.push({
          key: String(i),
          label: key,
          children,
        });

        return acc;
      },
      [],
    );
  }, [user]);

  return (
    <Descriptions
      bordered
      column={{ sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
      items={items!}
    />
  );
}
