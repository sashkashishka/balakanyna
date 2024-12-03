import { Row, Col, Form, Input, Button, InputNumber, ColorPicker } from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';
import { SortableFormList } from '@/components/FormFields/SortableFormList';

type TSemaphoreTextTask = Extract<TTask, { type: 'semaphoreText' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  initialValues?: Partial<TSemaphoreTextTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function SemaphoreTextConfigForm({
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'semaphore-text-config-form';
  const LS_KEY = `${action}:${formName}`;

  return (
    <Form
      name={formName}
      initialValues={{
        ...initialValues,
        ...safeLS.getItem(LS_KEY),
        type: 'semaphoreText',
      }}
      onFinish={async (values) => {
        const result = await onFinish(values);

        if (result) {
          safeLS.removeItem(LS_KEY);
        }
      }}
      autoComplete="off"
      layout="vertical"
      onValuesChange={(_, values) => {
        safeLS.setItem(LS_KEY, values);
      }}
    >
      <Row gutter={24}>
        <Form.Item<TSemaphoreTextTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TSemaphoreTextTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TSemaphoreTextTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<TSemaphoreTextTask>
            label="Delay range min (ms)"
            name={['config', 'delayRange', 0]}
            rules={[
              { required: true, message: 'Please input min delay range!' },
            ]}
          >
            <InputNumber placeholder="1000" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<TSemaphoreTextTask>
            label="Delay range max (ms)"
            name={['config', 'delayRange', 1]}
            rules={[
              { required: true, message: 'Please input max delay range!' },
            ]}
          >
            <InputNumber placeholder="2000" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <SortableFormList
            name={['config', 'colors']}
            label="Colors"
            addButtonLabel="Add color"
            item={{
              rules: [{ required: true, message: 'Please input color' }],
              normalize: (color) => color.toHexString(),
            }}
          >
            <ColorPicker />
          </SortableFormList>
        </Col>

        <Col span={12}>
          <SortableFormList
            name={['config', 'text']}
            label="Text"
            addButtonLabel="Add text"
            item={{
              rules: [{ required: true, message: 'Please enter some text' }],
            }}
          >
            <Input />
          </SortableFormList>
        </Col>

        <Col span={24}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large">
              {action === 'create' ? 'Save' : 'Update'}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
