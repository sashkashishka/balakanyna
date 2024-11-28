import { useState } from 'react';
import { Button, Drawer, Flex, Space } from 'antd';

import type { ITaskListFilters } from '@/stores/task';
import type { TTask } from '@/types/task';
import { TaskSelectDrawerContent } from './TaskSelectDrawerContent';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
  filters?: Partial<ITaskListFilters>;
  onSelect?(p: TTask): void;
}

export function TaskSelectDrawer({ onSelect, filters }: IProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TTask>();

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
        title="Pick an task"
        open={open}
        onClose={onDrawerClose}
        footer={
          <Space>
            <Flex style={{ width: '60px' }}>{selected?.id || 'none'}</Flex>

            <Button
              onClick={onDrawerSelect}
              type="primary"
              disabled={!selected}
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
