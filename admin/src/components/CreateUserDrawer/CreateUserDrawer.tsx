import { useState } from 'react';
import { Button, Drawer } from 'antd';

import { UserForm } from '../UserForm';

export function CreateUserDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new user
      </Button>

      <Drawer
        size="large"
        title="Create new user"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <UserForm name="user-create" action="create" />
      </Drawer>
    </>
  );
}
