import { useState, type ReactNode } from 'react';
import { Button, Drawer } from 'antd';

import { makeProgramStore } from '@/stores/program';

import { UpdateProgramDrawerContent } from './UpdateProgramDrawerContent';

interface IProps {
  programId: number;
  children?: ReactNode;
}

export function UpdateProgramDrawer({ programId, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [$program] = useState(() => makeProgramStore(programId));

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit program</Button>}
      </div>

      <Drawer
        size="large"
        title="Update program"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <UpdateProgramDrawerContent $program={$program} />
      </Drawer>
    </>
  );
}
