import { useEffect, useMemo } from 'react';
import { Row, Col, Form, Input, Button, type FormInstance } from 'antd';

import type { TTask } from 'shared/types/task';
import { safeLS } from '@/utils/storage';
import { SortableFormList } from '@/components/FormFields/SortableFormList';
import { ImageField } from '@/components/FormFields/ImageField';
import type { IImage } from 'shared/types/image';
import type { ITaskFormProps } from '../TaskForm';

type TImageSliderTask = Extract<TTask, { type: 'imageSlider' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TImageSliderTask>;
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

function prepareBody(body: TImageSliderTask) {
  // @ts-expect-error TODO should provide proper typing
  body.config.slides = body.config.slides.map(({ image }) => ({
    image: { id: image.id },
  }));

  return body;
}

export function ImageSliderConfigForm({
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
        title: initialValues?.config?.title || ' ',
        slides: initialValues?.config?.slides?.map(({ image }) => ({
          // @ts-expect-error TODO should provide proper typing
          image: normalizeImage(image),
        })),
      },
    };
  }, [initialValues]);

  const defaultValues = useMemo(
    () => ({
      ...normalizedInitialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'imageSlider',
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
        <Form.Item<TImageSliderTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TImageSliderTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TImageSliderTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TImageSliderTask>
            label="Slider title"
            name={['config', 'title']}
            rules={[{ required: true, message: 'Please input slider title' }]}
          >
            <Input type="text" placeholder="e.g. Slider for ..." />
          </Form.Item>
        </Col>

        <Col span={24}>
          <SortableFormList
            name={['config', 'slides']}
            item={{
              name: 'image',
              normalize: normalizeImage,
              rules: [{ required: true, message: 'Please input image' }],
            }}
            label="Slides"
            addButtonLabel="Add slide"
          >
            <ImageField />
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
