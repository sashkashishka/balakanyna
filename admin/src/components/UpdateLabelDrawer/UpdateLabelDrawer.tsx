import { useState, type ReactNode } from 'react';
import { Button, Drawer } from 'antd';

import { makeLabelStore } from '@/stores/label';

import { UpdateLabelDrawerContent } from './UpdateLabelDrawerContent';

interface IProps {
  labelId: number;
  children?: ReactNode;
}

export function UpdateLabelDrawer({ labelId, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [$label] = useState(() => makeLabelStore(labelId));

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit label</Button>}
      </div>

      <Drawer
        size="large"
        title="Update label"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <UpdateLabelDrawerContent $label={$label} />
      </Drawer>
    </>
  );
}

