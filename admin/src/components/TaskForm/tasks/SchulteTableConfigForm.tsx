import { useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  type FormInstance,
  InputNumber,
  Checkbox,
} from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TSchulteTableTask = Extract<TTask, { type: 'schulteTable' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TSchulteTableTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function SchulteTableConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'schulte-table-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'schulteTable',
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
        <Form.Item<TSchulteTableTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TSchulteTableTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TSchulteTableTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24} sm={8}>
          <Form.Item<TSchulteTableTask>
            label="X"
            name={['config', 'x']}
            rules={[{ required: true, message: 'Please input dimensions' }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>

        <Col span={24} sm={8}>
          <Form.Item<TSchulteTableTask>
            label="X"
            name={['config', 'y']}
            rules={[{ required: true, message: 'Please input dimensions' }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>

        <Col span={24} sm={8}>
          <Form.Item<TSchulteTableTask>
            label="Reverse"
            name={['config', 'reverse']}
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox />
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
