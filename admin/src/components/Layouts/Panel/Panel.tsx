import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { theme, Flex, Menu, Layout, Image, Typography, Button } from 'antd';

import {
  $router,
  openProgramList,
  openUserList,
  ROUTE_ALIAS,
} from '@/stores/router';

import logoImg from '@/images/logo-blue.png';

import { Breadcrumbs } from './Breadcrumbs';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const layoutStyle: React.CSSProperties = {
  minHeight: '100vh',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 80,
  paddingInline: 16,
  lineHeight: '64px',
  backgroundColor: 'rgb(200 230 255)',
};

const siderStyle: React.CSSProperties = {
  // backgroundColor: 'red',
};

interface IProps {
  children: React.ReactNode;
}

export function PanelLayout({ children }: IProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useStore($router);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <Flex justify="space-between" align="center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40,
            }}
          />
          <Flex
            justify="space-between"
            align="center"
            flex={1}
            style={{ marginLeft: '16px' }}
          >
            <Image preview={false} src={logoImg} width={80} height={80} />

            <Title level={2}>Balakanyna</Title>
          </Flex>
        </Flex>
      </Header>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsedWidth="0"
          collapsed={collapsed}
          style={siderStyle}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[String(router?.route)]}
            items={[
              {
                key: ROUTE_ALIAS.USER_LIST,
                icon: <UserOutlined />,
                label: 'User list',
                onClick() {
                  openUserList();
                },
              },
              {
                key: ROUTE_ALIAS.PROGRAM_LIST,
                icon: <DatabaseOutlined />,
                label: 'Program list',
                onClick() {
                  openProgramList();
                },
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumbs />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
