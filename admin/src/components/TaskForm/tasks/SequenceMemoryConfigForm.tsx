import { useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  type FormInstance,
  InputNumber,
} from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TSequenceMemoryTask = Extract<TTask, { type: 'sequenceMemory' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TSequenceMemoryTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function SequenceMemoryConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'sequence-memory-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'sequenceMemory',
    }),
    [initialValues],
  );

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [form, defaultValues]);

  return (
    <Form
      form={form}
      name={formName}
      validateTrigger={['onChange', 'onFocus']}
      initialValues={defaultValues}
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
        <Form.Item<TSequenceMemoryTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TSequenceMemoryTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TSequenceMemoryTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<TSequenceMemoryTask>
            label="Width"
            name={['config', 'width']}
            rules={[{ required: true, message: 'Please input width' }]}
          >
            <InputNumber min={2} max={10} />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<TSequenceMemoryTask>
            label="Height"
            name={['config', 'height']}
            rules={[{ required: true, message: 'Please input height' }]}
          >
            <InputNumber min={2} max={10} />
          </Form.Item>
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