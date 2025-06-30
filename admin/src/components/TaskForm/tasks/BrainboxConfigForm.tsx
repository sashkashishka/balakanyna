import { useEffect, useMemo } from 'react';
import { Row, Space, Col, Form, Input, Button, type FormInstance } from 'antd';

import type { TTask } from 'shared/types/task';
import { safeLS } from '@/utils/storage';
import { SortableFormList } from '@/components/FormFields/SortableFormList';
import { ImageField, ImageSelector } from '@/components/FormFields/ImageField';
import type { IImage } from 'shared/types/image';
import type { ITaskFormProps } from '../TaskForm';

type TBrainboxTask = Extract<TTask, { type: 'brainbox' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TBrainboxTask>;
  onFinish(v: unknown): Promise<boolean>;
}

function normalizeImage(value: IImage) {
  return {
    id: value.id,
    filename: value.filename,
    hashsum: value.hashsum,
    path: value.path,
  };
}

function prepareBody(body: TBrainboxTask) {
  // @ts-expect-error TODO should provide proper typing
  body.config.items = body.config.items.map(({ front, back }) => ({
    front: { id: front.id },
    back: { id: back.id },
  }));

  return body;
}

export function BrainboxConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'image-slider-config-form';
  const LS_KEY = `${action}:${formName}`;

  const normalizedInitialValues = useMemo(() => {
    return {
      id: initialValues?.id,
      name: initialValues?.name,
      type: initialValues?.type,
      config: {
        ...initialValues?.config,
        slides: initialValues?.config?.items?.map(({ front, back }) => ({
          // @ts-expect-error TODO should provide proper typing
          front: normalizeImage(front),
          // @ts-expect-error TODO should provide proper typing
          back: normalizeImage(back),
        })),
      },
    };
  }, [initialValues]);

  const defaultValues = useMemo(
    () => ({
      ...normalizedInitialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'brainbox',
    }),
    [normalizedInitialValues],
  );

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [form, defaultValues]);

  return (
    <Form
      form={form}
      name={formName}
      initialValues={defaultValues}
      onFinish={async (values) => {
        const result = await onFinish(prepareBody(values));

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
        <Form.Item<TBrainboxTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TBrainboxTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TBrainboxTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <SortableFormList
            name={['config', 'items'] as const}
            label="Items"
            item={{}}
            wrapWithField={false}
          >
            {({ index }) => (
              <>
                <Space>
                  <Form.Item<TBrainboxTask>
                    label="Front"
                    // @ts-expect-error nested form items
                    name={[index, 'front']}
                    rules={[
                      {
                        required: true,
                        message: 'Front part of the card is required',
                      },
                    ]}
                  >
                    <ImageField />
                  </Form.Item>

                  <ImageSelector
                    multipleSelect={false}
                    form={form}
                    // @ts-expect-error nested form items
                    name={['config', 'items', index, 'front']}
                    normalize={normalizeImage}
                  />
                </Space>

                <Space>
                  <Form.Item<TBrainboxTask>
                    label="Back"
                    // @ts-expect-error nested form items
                    name={[index, 'back']}
                    rules={[
                      {
                        required: true,

                        message: 'Back part of the card is required',
                      },
                    ]}
                  >
                    <ImageField />
                  </Form.Item>

                  <ImageSelector
                    multipleSelect={false}
                    form={form}
                    // @ts-expect-error nested form items
                    name={['config', 'items', index, 'back']}
                    normalize={normalizeImage}
                  />
                </Space>
              </>
            )}
          </SortableFormList>
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
