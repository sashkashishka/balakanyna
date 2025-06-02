import { useEffect, useMemo } from 'react';
import { Row, Col, Form, Input, Button, type FormInstance } from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TIframeViewerTask = Extract<TTask, { type: 'iframeViewer' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TIframeViewerTask>;
  onFinish(v: unknown): Promise<boolean>;
}

function extractUrlFromIframe(iframeString: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(iframeString, 'text/html');
    const iframe = doc.querySelector('iframe');
    return iframe!.getAttribute('src');
  } catch {
    // Method 3: Fallback string splitting
    try {
      // @ts-expect-error if this is not an iframe - let it throw an error
      return iframeString.split('src="')[1].split('"')[0];
    } catch {
      return iframeString;
    }
  }
}

export function IframeViewerConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'iframeViewer-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'iframeViewer',
    }),
    [initialValues],
  );

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [form, defaultValues]);

  return (
    <Form
      form={form}
      name={formName}
      validateTrigger={['onChange', 'onFocus']}
      initialValues={defaultValues}
      onFinish={async (values) => {
        const result = await onFinish(values);

        if (result) {
          safeLS.removeItem(LS_KEY);
        }
      }}
      autoComplete="off"
      layout="vertical"
      onValuesChange={(_, values) => {
        safeLS.setItem(LS_KEY, values);
      }}
    >
      <Row gutter={24}>
        <Form.Item<TIframeViewerTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TIframeViewerTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TIframeViewerTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TIframeViewerTask>
            label="Iframe link"
            name={['config', 'link']}
            rules={[{ required: true, message: 'Please input link' }]}
            normalize={extractUrlFromIframe}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large">
              {action === 'create' ? 'Save' : 'Update'}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
