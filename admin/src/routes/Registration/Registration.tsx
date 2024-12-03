import { useStore } from '@nanostores/react';
import {
  Button,
  Form,
  Input,
  Typography,
  Flex,
  Anchor,
  notification,
} from 'antd';

import { $register } from '@/stores/auth';
import type { ICredentials } from 'shared/types/auth';
import { openLogin, ROUTES } from '@/stores/router';

const { Title } = Typography;
const { Link } = Anchor;

export function RegistrationPage() {
  const { mutate } = useStore($register);

  async function onFinish(data: ICredentials) {
    try {
      const resp = (await mutate(data)) as Response;

      if (resp.ok) {
        return openLogin();
      }

      const respData = await resp.json();

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
    <Flex
      align="center"
      justify="center"
      vertical
      style={{ height: '100%', width: '100%' }}
    >
      <Title level={3}>Registration</Title>
      <br />
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<ICredentials>
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<ICredentials>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
      <hr />
      or
      <br />
      <br />
      <Link title="Login" href={ROUTES.login()} />
    </Flex>
  );
}
