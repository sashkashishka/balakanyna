import { useState } from 'react';
import { Button, Drawer } from 'antd';

import type { IImage } from '@/types/image';

import { ImageForm } from '../ImageForm';

interface IProps {
  onSuccess?(p: IImage): void;
}

export function CreateImageDrawer({ onSuccess }: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new image
      </Button>

      <Drawer
        size="default"
        title="Create new image"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <ImageForm
          onSuccess={(p) => {
            setOpen(false);
            onSuccess?.(p);
          }}
        />
      </Drawer>
    </>
  );
}
