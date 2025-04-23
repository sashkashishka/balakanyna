import {
  Row,
  Col,
  Form,
  Input,
  Button,
  ColorPicker,
  type FormInstance,
} from 'antd';

import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';
import { SortableFormList } from '@/components/FormFields/SortableFormList';
import { useEffect, useMemo } from 'react';

type TLettersToSyllableTask = Extract<TTask, { type: 'lettersToSyllable' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  initialValues?: Partial<TLettersToSyllableTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function LettersToSyllableConfigForm({
  form,
  initialValues,
  onFinish,
  action,
}: IProps) {
  const formName = 'letters-to-syllable-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({
      ...initialValues,
      ...(action === 'create' && safeLS.getItem(LS_KEY)),
      type: 'lettersToSyllable',
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
        <Form.Item<TLettersToSyllableTask> name="id" hidden>
          <Input />
        </Form.Item>

        <Col span={24}>
          <Form.Item<TLettersToSyllableTask> label="Task type" name="type">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item<TLettersToSyllableTask>
            label="Task name"
            name="name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input type="text" placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <SortableFormList
            name={['config', 'list'] as const}
            label="First part of syllable or word"
            item={{}}
            wrapWithField={false}
          >
            {({ index }) => (
              <>
                <Form.Item<TLettersToSyllableTask>
                  label="First part of syllable or word"
                  // @ts-expect-error nested form items
                  name={[index, 'first']}
                  rules={[
                    { required: true, message: 'First part is required' },
                  ]}
                >
                  <Input type="text" placeholder="e.g. В" />
                </Form.Item>

                <Form.Item<TLettersToSyllableTask>
                  label="Last part of syllable or word"
                  // @ts-expect-error nested form items
                  name={[index, 'last']}
                  rules={[{ required: true, message: 'Last part is required' }]}
                >
                  <Input type="text" placeholder="e.g. A" />
                </Form.Item>

                <Form.Item<TLettersToSyllableTask>
                  label="Vowel color"
                  // @ts-expect-error nested form items
                  name={[index, 'vowelColor']}
                  initialValue="#ff1616"
                  normalize={(color) => color.toHexString()}
                >
                  <ColorPicker />
                </Form.Item>
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
