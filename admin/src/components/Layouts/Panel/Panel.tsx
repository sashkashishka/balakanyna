import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
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
  Typography,
  Button,
  Breadcrumb,
} from 'antd';

import {
  $router,
  openHome,
  openUserList,
  ROUTE_ALIAS,
  ROUTE_TITLE,
} from '../../../stores/router';

import logoImg from '../../../images/logo-blue.png';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const layoutStyle: React.CSSProperties = {
  height: '100vh',
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
  const [collapsed, setCollapsed] = useState(true);
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
                key: '1',
                icon: <UserOutlined />,
                label: <span data-testid="1">'User'</span>,

                children: [
                  {
                    key: ROUTE_ALIAS.USER_LIST,
                    label: 'List',
                    onClick() {
                      openUserList();
                    },
                  },
                ],
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            items={[
              {
                title: ROUTE_TITLE[ROUTE_ALIAS.HOME],
                path: '',
                onClick(e) {
                  e.preventDefault();
                  openHome();
                },
              },
              {
                title:
                  router!.route === ROUTE_ALIAS.HOME
                    ? undefined
                    : ROUTE_TITLE[router!.route!],
              },
            ]}
            style={{ margin: '16px 0' }}
          />
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
