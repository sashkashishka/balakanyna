import { useStore } from '@nanostores/react';
import dayjs from 'dayjs';
import { Button, Col, DatePicker, Form, Input, notification, Row } from 'antd';

import type {
  IProgram,
  IProgramFull,
  IProgramBody,
} from 'shared/types/program';
import { $createProgram, $updateProgram } from '@/stores/program';
import { SortableFormList } from '@/components/FormFields/SortableFormList';

import { UserSearchInput } from '../UserSearchInput';
import { TaskField } from './TaskField';
import { TaskSelector } from './TaskSelector';

interface IProps {
  name: string;
  action: 'update' | 'create';
  initialValues?: Partial<IProgram>;
  onSuccess?(p: IProgram): void;
}

export function ProgramForm({
  name,
  action,
  initialValues,
  onSuccess,
}: IProps) {
  const [form] = Form.useForm();
  const { mutate: createProgram } = useStore($createProgram);
  const { mutate: updateProgram } = useStore($updateProgram);

  const isCreate = action === 'create';
  const isUpdate = action === 'update';

  async function onFinish(data: IProgramFull) {
    try {
      const mutate = isCreate ? createProgram : updateProgram;

      const body: IProgramBody = {
        ...data,
        tasks: isUpdate ? data.tasks.map((t) => ({ taskId: t.id })) : undefined,
      };

      if (Array.isArray(body.userId)) {
        body.userId = body.userId[0];
      }

      const resp = (await mutate(body)) as Response;
      const respData = await resp.json();

      if (resp.ok) {
        const message =
          'id' in respData ? 'Program updated' : 'Program created';
        notification.success({ message });

        if (isCreate) {
          return onSuccess?.(respData);
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
      form={form}
      name={name}
      style={{ maxWidth: '650px' }}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Row gutter={24}>
        <Form.Item<IProgram> name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="User"
            name="userId"
            rules={[{ required: true, message: 'Please pick the user!' }]}
          >
            <UserSearchInput
              disabled={Boolean(initialValues?.userId) || isUpdate}
            />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input program name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice program 1" />
          </Form.Item>
        </Col>

        <Col span={24} sm={12}>
          <Form.Item<IProgram>
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
          <Form.Item<IProgram>
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

        {isUpdate && (
          <Col span={24}>
            <SortableFormList
              name={['tasks']}
              item={{}}
              label="Tasks"
              addButton={<TaskSelector form={form} name={['tasks']} />}
            >
              <TaskField />
            </SortableFormList>
          </Col>
        )}

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
