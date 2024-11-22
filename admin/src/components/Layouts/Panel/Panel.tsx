import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  theme,
  Flex,
  Menu,
  Layout,
  Image,
  Button,
  Dropdown,
  Space,
  type MenuProps,
} from 'antd';

import {
  $router,
  openUserCreate,
  openUserList,
  ROUTE_ALIAS,
} from '@/stores/router';

import logoImg from '@/images/logo-blue.png';

import { Breadcrumbs } from './Breadcrumbs';

const { Header, Content, Sider } = Layout;

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

const createButtons: MenuProps['items'] = [
  {
    key: ROUTE_ALIAS.USER_CREATE,
    label: 'User',
    icon: <UserOutlined />,
    onClick: openUserCreate,
  },
];

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

            <Dropdown menu={{ items: createButtons }}>
              <Button variant="solid" color="primary" size="large">
                <Space>
                  Create
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
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
