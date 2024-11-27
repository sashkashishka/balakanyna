import { useState, type ReactNode } from 'react';
import { Button, Drawer } from 'antd';

import { makeTaskStore } from '@/stores/task';

import { UpdateTaskDrawerContent } from './UpdateTaskDrawerContent';

interface IProps {
  taskId: number;
  children?: ReactNode;
}

export function UpdateTaskDrawer({ taskId, children }: IProps) {
  const [open, setOpen] = useState(false);
  const [$task] = useState(() => makeTaskStore(taskId));

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || <Button>Edit task</Button>}
      </div>

      <Drawer
        size="large"
        title="Update task"
        open={open}
        onClose={() => setOpen(false)}
      >
        <UpdateTaskDrawerContent $task={$task} />
      </Drawer>
    </>
  );
}

