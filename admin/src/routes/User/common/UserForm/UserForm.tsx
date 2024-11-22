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
import type { IUser } from '@/types/user';

interface IProps {
  action: 'update' | 'create';
  initialValues: IUser;
}

export function UserForm({ action, initialValues }: IProps) {
  const { mutate: createUser } = useStore($createUser);
  const { mutate: updateUser } = useStore($updateUser);

  async function onFinish(data: IUser) {
    try {
      const mutate = action === 'update' ? updateUser : createUser;

      const resp = (await mutate(data)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = 'id' in respData ? 'User updated' : 'User created';
        return notification.success({ message });
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
    <>
      <Form
        name="user"
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
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
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
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                {action === 'create' ? 'Save' : 'Create'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}
