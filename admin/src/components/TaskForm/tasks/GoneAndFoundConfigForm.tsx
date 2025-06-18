import { useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  type FormInstance,
} from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TGoneAndFoundTask = Extract<TTask, { type: 'goneAndFound' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TGoneAndFoundTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function GoneAndFoundConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'goneAndFound-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'goneAndFound',
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
        <Form.Item<TGoneAndFoundTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TGoneAndFoundTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TGoneAndFoundTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TGoneAndFoundTask>
            label="Preset"
            name={['config', 'preset']}
            rules={[{ required: true, message: 'Please select preset!' }]}
          >
            <Select
              options={[{ value: 'default', label: <span>Vegetables</span> }]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Items to show min"
            name={['config', 'items', 'min']}
            rules={[{ required: true, message: 'Please input items min!' }]}
          >
            <InputNumber min={1} max={11} placeholder="e.g. 1" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Items to show max"
            name={['config', 'items', 'max']}
            rules={[{ required: true, message: 'Please input items max!' }]}
          >
            <InputNumber min={1} max={11} placeholder="e.g. 11" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Limit type"
            name={['config', 'limit', 'type']}
            rules={[{ required: true, message: 'Please input limit type!' }]}
          >
            <Select
              options={[
                { value: 'timer', label: <span>Timer</span> },
                { value: 'rounds', label: <span>Rounds</span> },
              ]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Limit value"
            tooltip="number of rounds or seconds"
            name={['config', 'limit', 'value']}
            rules={[{ required: true, message: 'Please input limit value!' }]}
          >
            <InputNumber min={1} placeholder="e.g. 10 or 60" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Minimal y"
            name={['config', 'y', 'min']}
            rules={[{ required: true, message: 'Please input y min!' }]}
          >
            <InputNumber min={3} max={5} placeholder="e.g. 3" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TGoneAndFoundTask>
            label="Maximum y"
            name={['config', 'y', 'max']}
            rules={[{ required: true, message: 'Please input y max!' }]}
          >
            <InputNumber min={3} max={5} placeholder="e.g. 5" />
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
