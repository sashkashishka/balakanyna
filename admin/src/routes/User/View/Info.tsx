import { useState } from 'react';
import { Button, Descriptions, Flex, Space } from 'antd';
import { useStore } from '@nanostores/react';
import { $userDescriptionItems, $userFormValues } from '@/stores/user';
import { UserForm } from '../component/UserForm';

export function UserInfo() {
  const [isEdit, setIsEdit] = useState(false);
  const userFormValues = useStore($userFormValues);
  const items = useStore($userDescriptionItems);

  return (
    <>
      <Space direction="vertical">
        <Flex justify="end">
          <Button onClick={() => setIsEdit(!isEdit)}>
            {isEdit ? 'Close' : 'Edit'}
          </Button>
        </Flex>

        {isEdit ? (
          <UserForm
            name="update-user"
            initialValues={userFormValues}
            action="update"
          />
        ) : (
          <Descriptions
            bordered
            column={{ sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            items={items!}
          />
        )}
      </Space>
    </>
  );
}
