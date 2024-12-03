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

import { $createUser, $updateUser } from '@/stores/user';
import { redirectUserView } from '@/stores/router';
import type { IUser } from 'shared/types/user';

interface IProps {
  name: string;
  action: 'update' | 'create';
  initialValues?: Omit<IUser, 'birthdate'> & { birthdate: Dayjs };
}

export function UserForm({ name, action, initialValues }: IProps) {
  const { mutate: createUser } = useStore($createUser);
  const { mutate: updateUser } = useStore($updateUser);

  const isCreate = action === 'create';

  async function onFinish(data: IUser) {
    try {
      const mutate = isCreate ? createUser : updateUser;

      const resp = (await mutate(data)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = 'id' in respData ? 'User updated' : 'User created';
        notification.success({ message });

        if (isCreate) {
          return redirectUserView(respData.id);
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
        <Form.Item<IUser> name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Col span={24} sm={12}>
          <Form.Item<IUser>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input type="text" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser>
            label="Surname"
            name="surname"
            rules={[
              { required: true, message: 'Please write down your surname!' },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser>
            label="Birthdate"
            name="birthdate"
            rules={[{ required: true, message: 'Please pick a birthdate' }]}
          >
            <DatePicker />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser>
            label="Grade"
            name="grade"
            rules={[{ required: true, message: 'Please point a grade' }]}
          >
            <InputNumber min={1} max={15} />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser> label="Email" name="email">
            <Input type="email" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser> label="Phone" name="phoneNumber">
            <Input type="tel" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser> label="Messangers" name="messangers">
            <Input />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IUser> label="Notes" name="notes">
            <Input.TextArea rows={5} />
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
