import { useStore } from '@nanostores/react';
import {
  Button,
  Typography,
  Flex,
  Form,
  Input,
  Anchor,
  notification,
} from 'antd';

import { $login } from '../../stores/auth';
import type { ICredentials } from '../../types/auth';
import { openHome, ROUTES } from '../../stores/router';

const { Title } = Typography;
const { Link } = Anchor;

export function LoginPage() {
  const { mutate } = useStore($login);

  async function onFinish(data: ICredentials) {
    try {
      const resp = (await mutate(data)) as Response;

      if (resp.ok) {
        return openHome();
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
      <Title level={3}>Login</Title>
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
            Login
          </Button>
        </Form.Item>
      </Form>
      <hr />
      or
      <br />
      <br />
      <Link title="Register" href={ROUTES.registartion()} />
    </Flex>
  );
}
