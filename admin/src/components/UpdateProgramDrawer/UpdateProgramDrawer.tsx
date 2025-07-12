import { useMemo, useState, type ReactNode } from 'react';
import { Button, Drawer, Flex, Typography } from 'antd';

import { makeProgramStore } from '@/stores/program';

import { UpdateProgramDrawerContent } from './UpdateProgramDrawerContent';
import { CopyProgramDrawer } from '../CopyProgramDrawer';

interface IProps {
  programId: number;
  children?: ReactNode;
}

export function UpdateProgramDrawer({ programId, children }: IProps) {
  const [open, setOpen] = useState(false);
  const $program = useMemo(() => makeProgramStore(programId), [programId]);

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit program</Button>}
      </div>

      <Drawer
        size="large"
        title={
          <Flex justify="space-between" align="center">
            <Typography.Title level={5} style={{ margin: 0 }}>
              Update program
            </Typography.Title>

            <CopyProgramDrawer $program={$program} />
          </Flex>
        }
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <UpdateProgramDrawerContent $program={$program} />
      </Drawer>
    </>
  );
}
