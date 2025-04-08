import { useState } from 'react';
import { Button, Drawer, Space } from 'antd';

import type { ITaskListFilters } from '@/stores/task';
import type { TTask } from 'shared/types/task';
import { TaskSelectDrawerContent } from './TaskSelectDrawerContent';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  filters?: Partial<ITaskListFilters>;
  onSelect?(p: TTask[]): void;
}

export function TaskSelectDrawer({ onSelect, filters }: IProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TTask[]>();

  const onDrawerClose = () => {
    setSelected(undefined);
    setOpen(false);
  };

  const onDrawerSelect = () => {
    onSelect?.(selected!);
    setSelected(undefined);
    setOpen(false);
  };

  return (
    <>
      <Button
        icon={<PlusOutlined />}
        type="dashed"
        onClick={() => setOpen(true)}
      >
        Add task
      </Button>

      <Drawer
        size="large"
        title="Pick the task"
        open={open}
        onClose={onDrawerClose}
        footer={
          <Space>
            <Button
              onClick={onDrawerSelect}
              type="primary"
              disabled={selected?.length === 0}
            >
              Select
            </Button>
            <Button onClick={onDrawerClose}>Cancel</Button>
          </Space>
        }
        destroyOnClose
      >
        <TaskSelectDrawerContent filters={filters} setSelected={setSelected} />
      </Drawer>
    </>
  );
}
