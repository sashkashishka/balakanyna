import { Flex, Image, Space, Typography, theme } from 'antd';

import logoBlue from '@/images/logo-blue.png';

const { Title } = Typography;

export function HomePage() {
  const {
    token: { borderRadius },
  } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: '100%', height: '100%' }}
    >
      <Space direction="vertical" size="large" align="center">
        <Image
          src={logoBlue}
          preview={false}
          width="300px"
          height="300px"
          style={{ borderRadius: borderRadius }}
        />

        <Title level={3}>Welcome to your space, Nika!</Title>
      </Space>
    </Flex>
  );
}
