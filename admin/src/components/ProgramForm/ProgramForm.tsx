import type { Dayjs } from 'dayjs';
import { useStore } from '@nanostores/react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Row,
} from 'antd';

import { redirectProgramView } from '@/stores/router';
import type { IProgram } from '@/types/user';
import { $createProgram, $updateProgram } from '@/stores/program';

interface IProps {
  name: string;
  action: 'update' | 'create';
  initialValues?: Omit<IProgram, 'birthdate'> & { birthdate: Dayjs };
}

export function ProgramForm({ name, action, initialValues }: IProps) {
  const { mutate: createProgram } = useStore($createProgram);
  const { mutate: updateProgram } = useStore($updateProgram);

  const isCreate = action === 'create';
  const isUpdate = action === 'update';

  async function onFinish(data: IProgram) {
    try {
      const mutate = isCreate ? createProgram : updateProgram;

      const resp = (await mutate(data)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message =
          'id' in respData ? 'Program updated' : 'Program created';
        notification.success({ message });

        if (isCreate) {
          return redirectProgramView(respData.id);
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
      name={name}
      style={{ maxWidth: '650px' }}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Row gutter={24}>
        <Form.Item<IProgram> name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="User"
            name="userId"
            rules={[
              { required: true, message: 'Please pick the user!' },
            ]}
          >
            <Input disabled={isUpdate} />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input program name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice program 1" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="Birthdate"
            name="startDatetime"
            rules={[
              { required: true, message: 'Please pick a start datetime' },
            ]}
          >
            <DatePicker />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="Birthdate"
            name="expirationDatetime"
            rules={[
              { required: true, message: 'Please pick an expiration datetime' },
            ]}
          >
            <DatePicker />
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
