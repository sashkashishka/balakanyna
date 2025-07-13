import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';
import dayjs from 'dayjs';
import { Button, Col, DatePicker, Form, Input, notification, Row } from 'antd';
import { useLayoutEffect } from 'react';

import type { IProgramCopy, IProgramFull } from 'shared/types/program';
import { $copyProgram } from '@/stores/program';
import { makeUserStore } from '@/stores/user';
import { openUserProgramView } from '@/stores/router';
import { UserSearchInput } from '../UserSearchInput';

interface IProps {
  name: string;
  program: IProgramFull;
  initialValues?: Partial<IProgramCopy>;
}

const $userId = atom<number>(0);
const $user = makeUserStore($userId);

export function CopyProgramForm({ name, program, initialValues }: IProps) {
  const [form] = Form.useForm();

  useLayoutEffect(() => {
    $userId.set(program.userId);
  }, []);

  const { data: user, loading } = useStore($user);
  const { mutate } = useStore($copyProgram);

  async function onFinish(data: IProgramCopy) {
    try {
      if (Array.isArray(data.userId)) {
        data.userId = data.userId[0];
      }

      const resp = (await mutate(data)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message = (
          <>
            Program copied! <br />
            You can see it{' '}
            <Button
              type="link"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => openUserProgramView(String(data.userId))}
            >
              here
            </Button>
          </>
        );
        notification.success({ message });

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
      form={form}
      name={name}
      style={{ maxWidth: '650px' }}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Row gutter={24}>
        <Form.Item<IProgramCopy> name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item<IProgramCopy> name="userId" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Col span={24} sm={12}>
          Copy from the user
          <br />
          <b>{loading ? '...' : `${user?.name} ${user?.surname}`}</b>
          <br />
          <br />
        </Col>

        <Col span={24} sm={12}>
          Copy program:
          <br />
          <b>id: {program.id}</b>
          <br />
          <b>name: {program.name}</b>
          <br />
          <br />
        </Col>

        <Col span={24}>
          <Form.Item<IProgramCopy>
            label="To user"
            name="userId"
            rules={[{ required: true, message: 'Please pick the user!' }]}
          >
            <UserSearchInput />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgramCopy>
            label="Start date"
            name="startDatetime"
            rules={[
              { required: true, message: 'Please pick a start datetime' },
            ]}
            getValueProps={(value) => ({
              value: value && dayjs(value),
            })}
            normalize={(value) => value && `${dayjs(value).toISOString()}`}
          >
            <DatePicker minDate={dayjs()} showTime />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgramCopy>
            label="Expiration date"
            name="expirationDatetime"
            rules={[
              { required: true, message: 'Please pick an expiration datetime' },
            ]}
            getValueProps={(value) => ({
              value: value && dayjs(value),
            })}
            normalize={(value) => value && `${dayjs(value).toISOString()}`}
          >
            <DatePicker minDate={dayjs()} showTime />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large">
              Copy
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
