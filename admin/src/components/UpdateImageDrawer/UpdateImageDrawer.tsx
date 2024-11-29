import { useState, type ReactNode } from 'react';
import { Button, Drawer } from 'antd';

import { makeImageStore } from '@/stores/image';

import { UpdateImageDrawerContent } from './UpdateImageDrawerContent';

interface IProps {
  imageId: number;
  children?: ReactNode;
  onClose?(): void;
}

export function UpdateImageDrawer({ imageId, onClose, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [$image] = useState(() => makeImageStore(imageId));

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit image</Button>}
      </div>

      <Drawer
        size="default"
        title="Update image"
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        destroyOnClose
      >
        <UpdateImageDrawerContent $image={$image} />
      </Drawer>
    </>
  );
}
