import { useMemo, useState } from 'react';
import { Button, Drawer } from 'antd';
import dayjs from 'dayjs';

import type { IUser } from '@/types/user';

import { UserForm } from '../UserForm';

interface IProps {
  user: IUser;
}

export function UpdateUserDrawer({ user }: IProps) {
  const [open, setOpen] = useState(false);

  const userFormValues = useMemo(() => {
    return {
      ...user,
      birthdate: dayjs(user.birthdate),
    };
  }, [user]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit user</Button>

      <Drawer
        size="large"
        title="Update user"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <UserForm
          name="user-update"
          action="update"
          initialValues={userFormValues}
        />
      </Drawer>
    </>
  );
}
