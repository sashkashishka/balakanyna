import { useState } from 'react';
import { Button, Drawer, Select, Space } from 'antd';

import { TaskForm } from '../TaskForm';
import { type TTaskType, type TTask } from '@/types/task';
import { taskTypeOptions } from '../TaskForm/constants';

interface IProps {
  onSuccess?(p: TTask): void;
}

export function CreateTaskDrawer({ onSuccess }: IProps) {
  const [taskType, setTaskType] = useState<TTaskType>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new task
      </Button>

      <Drawer
        size="large"
        title="Create new task"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Select
            value={taskType}
            options={taskTypeOptions}
            onSelect={(v) => setTaskType(v)}
            style={{ width: '100%' }}
            placeholder="Select task type"
          />

          {taskType && (
            <TaskForm
              name="task-create"
              action="create"
              taskType={taskType}
              onSuccess={(p) => {
                setOpen(false);
                onSuccess?.(p);
              }}
            />
          )}
        </Space>
      </Drawer>
    </>
  );
}
