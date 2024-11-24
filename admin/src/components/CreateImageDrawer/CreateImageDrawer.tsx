import { useState } from 'react';
import { Button, Drawer } from 'antd';

import { ImageForm, type IImageFormInitialValues } from '../ImageForm';
import type { IImage } from '@/types/image';

interface IProps {
  initialValues?: Partial<IImageFormInitialValues>;
  onSuccess?(p: IImage): void;
}

export function CreateImageDrawer({ initialValues, onSuccess }: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new image
      </Button>

      <Drawer
        size="large"
        title="Create new image"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <ImageForm
          name="image-create"
          action="create"
          onSuccess={(p) => {
            setOpen(false);
            onSuccess?.(p);
          }}
          initialValues={initialValues}
        />
      </Drawer>
    </>
  );
}
