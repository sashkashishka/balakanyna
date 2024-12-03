import { useState } from 'react';
import { Button, Drawer } from 'antd';

import type { IProgram } from 'shared/types/program';
import { ProgramForm } from '../ProgramForm';

interface IProps {
  initialValues?: Partial<IProgram>;
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
        destroyOnClose
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
