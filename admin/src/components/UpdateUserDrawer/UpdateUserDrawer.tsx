import { useState } from 'react';
import { Button, Drawer } from 'antd';
import { useStore } from '@nanostores/react';

import { $userFormValues } from '@/stores/user';

import { UserForm } from '../UserForm';

export function UpdateUserDrawer() {
  const [open, setOpen] = useState(false);
  const userFormValues = useStore($userFormValues);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit user</Button>

      <Drawer
        size="large"
        title="Update user"
        open={open}
        onClose={() => setOpen(false)}
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
