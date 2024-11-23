import { useStore } from '@nanostores/react';
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Row,
  Select,
  Switch,
  Tag,
  type SelectProps,
} from 'antd';

import type { ILabel } from '@/types/label';
import { $createLabel, $updateLabel } from '@/stores/label';

const typeOptions: SelectProps['options'] = [
  { value: 'image', label: 'Image' },
  { value: 'task', label: 'Task' },
];

const colorPresets: SelectProps['options'] = [
  {
    label: <Tag color="magenta">magenta</Tag>,
    value: 'magenta',
  },
  {
    label: <Tag color="red">red</Tag>,
    value: 'red',
  },
  {
    label: <Tag color="volcano">volcano</Tag>,
    value: 'volcano',
  },
  {
    label: <Tag color="orange">orange</Tag>,
    value: 'orange',
  },
  {
    label: <Tag color="gold">gold</Tag>,
    value: 'gold',
  },
  {
    label: <Tag color="lime">lime</Tag>,
    value: 'lime',
  },
  {
    label: <Tag color="green">green</Tag>,
    value: 'green',
  },
  {
    label: <Tag color="cyan">cyan</Tag>,
    value: 'cyan',
  },
  {
    label: <Tag color="blue">blue</Tag>,
    value: 'blue',
  },
  {
    label: <Tag color="geekblue">geekblue</Tag>,
    value: 'geekblue',
  },
  {
    label: <Tag color="purple">purple</Tag>,
    value: 'purple',
  },
];

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILabelFormInitialValues extends ILabel {}

interface IProps {
  name: string;
  action: 'update' | 'create';
  initialValues?: Partial<ILabelFormInitialValues>;
  onSuccess?(p: ILabel): void;
}

export function LabelForm({ name, action, initialValues, onSuccess }: IProps) {
  const [form] = Form.useForm<ILabel>();
  const tag = Form.useWatch((v) => v, form);

  const { mutate: createLabel } = useStore($createLabel);
  const { mutate: updateLabel } = useStore($updateLabel);

  const isCreate = action === 'create';

  async function onFinish(data: ILabel) {
    try {
      const mutate = isCreate ? createLabel : updateLabel;

      const body = {
        ...data,
        config: { ...data.config, bordered: Boolean(data.config.bordered) },
      };

      const resp = (await mutate(body)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = 'id' in respData ? 'Label updated' : 'Label created';
        notification.success({ message });

        if (isCreate) {
          return onSuccess?.(respData);
        }

        return;
      }

      if ('error' in respData && typeof respData.message === 'string') {
        return notification.error({ message: respData.message });
      }

      throw respData;
    } catch (e) {
      console.error(e);
      notification.error({ message: 'Unexpected error' });
    }
  }

  return (
    <Form
      form={form}
      name={name}
      style={{ maxWidth: '650px' }}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Tag color={tag?.config?.color} bordered={!!tag?.config?.bordered}>
        {tag?.name}
      </Tag>

      <br />
      <br />

      <Row gutter={24}>
        <Form.Item<ILabel> name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Col span={24} sm={12}>
          <Form.Item<ILabel>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input label name!' }]}
          >
            <Input type="text" placeholder="e.g. Games" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<ILabel>
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please input label name!' }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<ILabel>
            label="Color"
            name={['config', 'color']}
            rules={[
              { required: true, message: 'Please pick a start datetime' },
            ]}
          >
            <Select options={colorPresets} />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<ILabel> label="Bordered" name={['config', 'bordered']}>
            <Switch />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large">
              {isCreate ? 'Create' : 'Update'}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
