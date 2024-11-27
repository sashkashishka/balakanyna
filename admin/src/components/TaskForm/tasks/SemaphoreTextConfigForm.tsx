import {
  Row,
  Col,
  Form,
  Input,
  Button,
  InputNumber,
  Space,
  ColorPicker,
} from 'antd';

import type { TTask } from '@/types/task';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

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

        <Form.Item<TSemaphoreTextTask> name="type" hidden>
          <Input />
        </Form.Item>

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
          <Form.List name={['config', 'colors']}>
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                Colors
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline">
                    <Form.Item
                      name={[name]}
                      rules={[
                        { required: true, message: 'Please input color' },
                      ]}
                      normalize={(color) => color.toHexString()}
                    >
                      <ColorPicker />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add color
                  </Button>
                </Form.Item>
              </Space>
            )}
          </Form.List>
        </Col>

        <Col span={12}>
          <Form.List name={['config', 'text']}>
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                Text
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline">
                    <Form.Item
                      name={[name]}
                      rules={[
                        { required: true, message: 'Please enter some text' },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add text
                  </Button>
                </Form.Item>
              </Space>
            )}
          </Form.List>
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
