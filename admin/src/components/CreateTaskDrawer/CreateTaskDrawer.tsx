import { useState } from 'react';
import { Button, Drawer, Card, Row, Col, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { TaskForm } from '../TaskForm';
import { type TTaskType } from 'shared/types/task';
import { tasks } from 'shared/schemas/common';
import type { ITaskFormProps } from '../TaskForm/TaskForm';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps extends Pick<ITaskFormProps, 'onDuplicate' | 'onSuccess'> {}

export function CreateTaskDrawer({ onSuccess, onDuplicate }: IProps) {
  const [taskType, setTaskType] = useState<TTaskType>();
  const [open, setOpen] = useState(false);

  const handleBack = () => {
    setTaskType(undefined);
  };

  const handleClose = () => {
    setOpen(false);
    setTaskType(undefined);
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create new task
      </Button>

      <Drawer
        width="1024px"
        title={
          taskType ? (
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
              >
                Back
              </Button>
              <span>Create {taskType} task</span>
            </Space>
          ) : (
            'Create new task'
          )
        }
        open={open}
        closable={!taskType}
        onClose={taskType ? handleBack : handleClose}
      >
        {!taskType ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              {(tasks as TTaskType[]).map((task) => (
                <Col span={8} key={task}>
                  <Card
                    hoverable
                    onClick={() => setTaskType(task)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <Card.Meta title={task} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Space>
        ) : (
          <TaskForm
            action="create"
            taskType={taskType}
            onDuplicate={(id) => {
              handleClose();
              onDuplicate?.(id);
            }}
            onSuccess={(p) => {
              handleClose();
              onSuccess?.(p);
            }}
          />
        )}
      </Drawer>
    </>
  );
}
