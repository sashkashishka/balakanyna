import { useState } from 'react';
import { PlusCircleFilled } from '@ant-design/icons';
import { Drawer, FloatButton } from 'antd';

import { UserForm } from '../UserForm';

export function CreateUserDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatButton
        shape="square"
        type="primary"
        tooltip="Create new user"
        icon={<PlusCircleFilled />}
        onClick={() => setOpen(true)}
        style={{ insetInlineEnd: 94 }}
      />

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
