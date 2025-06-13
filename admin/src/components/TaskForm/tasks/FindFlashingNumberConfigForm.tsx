import { useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Button,
  type FormInstance,
} from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TFindFlashingNumberTask = Extract<TTask, { type: 'findFlashingNumber' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TFindFlashingNumberTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function FindFlashingNumberConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'findFlashingNumber-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'findFlashingNumber',
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
        <Form.Item<TFindFlashingNumberTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TFindFlashingNumberTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TFindFlashingNumberTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Duration (s)"
            name={['config', 'duration']}
            rules={[{ required: true, message: 'Please input duration!' }]}
          >
            <InputNumber min={0} placeholder="e.g. 60" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Streak length (s)"
            tooltip="Used to adjust how quickly the game gets difficult"
            name={['config', 'streak', 'length']}
            rules={[{ required: true, message: 'Please input streak length!' }]}
          >
            <InputNumber min={1} placeholder="e.g. 10" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Animation min (ms)"
            name={['config', 'animation', 'min']}
            rules={[{ required: true, message: 'Please input animation min!' }]}
          >
            <InputNumber min={100} placeholder="e.g. 1000" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Animation max (ms)"
            name={['config', 'animation', 'max']}
            rules={[{ required: true, message: 'Please input animation max!' }]}
          >
            <InputNumber min={100} placeholder="e.g. 1000" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Positional digits min (tens, hundreds or thousands)"
            tooltip="Minimal number of digits"
            name={['config', 'positionalDigit', 'min']}
            rules={[
              { required: true, message: 'Please input positionalDigit min!' },
            ]}
          >
            <InputNumber min={2} max={4} placeholder="e.g. 2" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Positional digits max (tens, hundreds or thousands)"
            tooltip="Maximum number of digits"
            name={['config', 'positionalDigit', 'max']}
            rules={[
              { required: true, message: 'Please input positionalDigit max!' },
            ]}
          >
            <InputNumber min={2} max={4} placeholder="e.g. 4" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Minimal y"
            name={['config', 'y', 'min']}
            rules={[{ required: true, message: 'Please input y min!' }]}
          >
            <InputNumber min={3} placeholder="e.g. 3" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Maximum y"
            name={['config', 'y', 'max']}
            rules={[{ required: true, message: 'Please input y max!' }]}
          >
            <InputNumber min={3} placeholder="e.g. 6" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Minimal x"
            name={['config', 'x', 'min']}
            rules={[{ required: true, message: 'Please input x min!' }]}
          >
            <InputNumber min={3} placeholder="e.g. 3" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item<TFindFlashingNumberTask>
            label="Maximum x"
            name={['config', 'x', 'max']}
            rules={[{ required: true, message: 'Please input x max!' }]}
          >
            <InputNumber min={3} placeholder="e.g. 6" />
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
