import { useState } from 'react';
import { Button, Drawer } from 'antd';

import { ProgramForm, type IProgramFormInitialValues } from '../ProgramForm';
import type { IProgram } from '@/types/program';

interface IProps {
  initialValues?: Partial<IProgramFormInitialValues>;
  onSuccess?(p: IProgram): void;
}

export function CreateProgramDrawer({ initialValues, onSuccess }: IProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new program
      </Button>

      <Drawer
        size="large"
        title="Create new program"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ProgramForm
          name="program-create"
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
