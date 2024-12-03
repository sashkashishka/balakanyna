import { useState } from 'react';
import { Button, Drawer } from 'antd';

import { LabelForm, type ILabelFormInitialValues } from '../LabelForm';
import type { ILabel } from 'shared/types/label';

interface IProps {
  initialValues?: Partial<ILabelFormInitialValues>;
  onSuccess?(p: ILabel): void;
}

export function CreateLabelDrawer({ initialValues, onSuccess }: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new label
      </Button>

      <Drawer
        size="large"
        title="Create new label"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        
        <LabelForm
          name="label-create"
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

