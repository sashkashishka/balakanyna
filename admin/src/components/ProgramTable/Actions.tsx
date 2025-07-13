import { Dropdown, Space, Button, Popconfirm, notification } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $deleteProgram } from '@/stores/program';

interface IProps {
  programId: number;
}

export function Actions({ programId }: IProps) {
  const { mutate } = useStore($deleteProgram);

  const menu = useMemo<MenuProps>(
    () => ({
      items: [
        {
          key: '0',
          label: (
            <Popconfirm
              title="Delete the program"
              description="Are you sure to delete this program?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                const resp = await mutate({ id: programId });

                if (resp.ok) {
                  const data = await resp.json();

                  if (data.result === 'ok') {
                    notification.success({
                      message: 'Program successfully deleted',
                    });
                  } else {
                    notification.error({ message: data.result });
                  }
                }
              }}
            >
              <Button danger>Delete program</Button>
            </Popconfirm>
          ),
        },
      ],
    }),
    [programId],
  );

  return (
    <Dropdown menu={menu} trigger={['click']}>
      <Button type="link">
        <Space>
          more
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
