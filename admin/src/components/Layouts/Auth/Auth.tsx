import React from 'react';
import { Flex, Layout, Image, Typography } from 'antd';

import logoImg from '../../../images/logo-blue.png';

const { Header, Content } = Layout;
const { Title } = Typography;

const layoutStyle: React.CSSProperties = {
  height: '100vh',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 80,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: 'rgb(200 230 255)',
};

const contentStyle: React.CSSProperties = {
  flexGrow: 1,
};

interface IProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: IProps) {
  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <Flex justify="space-between" align="center">
          <Image preview={false} src={logoImg} width={80} height={80} />

          <Title level={2}>Balakanyna</Title>
        </Flex>
      </Header>
      <Content style={contentStyle}>{children}</Content>
    </Layout>
  );
}
