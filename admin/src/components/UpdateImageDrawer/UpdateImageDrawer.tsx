import { useState, type ReactNode } from 'react';
import { Button, Drawer } from 'antd';

import { makeImageStore } from '@/stores/image';

import { UpdateImageDrawerContent } from './UpdateImageDrawerContent';

interface IProps {
  imageId: number;
  children?: ReactNode;
}

export function UpdateImageDrawer({ imageId, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [$image] = useState(() => makeImageStore(imageId));

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit image</Button>}
      </div>

      <Drawer
        size="large"
        title="Update image"
        open={open}
        onClose={() => setOpen(false)}
      >
        <UpdateImageDrawerContent $image={$image} />
      </Drawer>
    </>
  );
}
