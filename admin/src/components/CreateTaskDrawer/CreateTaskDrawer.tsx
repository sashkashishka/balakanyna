import { useState } from 'react';
import { Button, Drawer, Select, Space } from 'antd';

import { TaskForm } from '../TaskForm';
import { type TTaskType } from 'shared/types/task';
import { taskTypeOptions } from '../TaskForm/constants';
import type { ITaskFormProps } from '../TaskForm/TaskForm';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps extends Pick<ITaskFormProps, 'onDuplicate' | 'onSuccess'> {}

export function CreateTaskDrawer({ onSuccess, onDuplicate }: IProps) {
  const [taskType, setTaskType] = useState<TTaskType>();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new task
      </Button>

      <Drawer
        width="1024px"
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
              action="create"
              taskType={taskType}
              onDuplicate={(id) => {
                setOpen(false);
                onDuplicate?.(id);
              }}
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
