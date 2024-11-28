import { Row, Col, Form, Input, Button } from 'antd';

import type { TTask } from '@/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';
import { SortableFormList } from '@/components/SortableFormList';
import { ImageField } from '../components/ImageField';

type TImageSliderTask = Extract<TTask, { type: 'imageSlider' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  initialValues?: Partial<TImageSliderTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function ImageSliderConfigForm({
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'image-slider-config-form';
  const LS_KEY = `${action}:${formName}`;

  return (
    <Form
      name={formName}
      initialValues={{
        ...initialValues,
        ...safeLS.getItem(LS_KEY),
        type: 'imageSlider',
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
        <Form.Item<TImageSliderTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TImageSliderTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TImageSliderTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <SortableFormList
            name={['config', 'slides']}
            item={{
              name: 'image',
              rules: [{ required: true, message: 'Please input image' }],
            }}
            label="Slides"
            addButtonLabel="Add slide"
          >
            <ImageField />
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
