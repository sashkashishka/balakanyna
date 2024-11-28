import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Button, Space } from 'antd';
import type { FormItemProps, Rule } from 'antd/es/form';

import { atLeastOneEntry } from '../../validators';
import type { ReactNode } from 'react';

interface IProps {
  name: string | number | (string | number)[];
  item: FormItemProps;
  label: ReactNode;
  addButtonLabel: ReactNode;
  children: ReactNode;
}

export function SortableList({
  name,
  item,
  label,
  addButtonLabel,
  children,
}: IProps) {
  return (
    <Form.List name={name} rules={[{ validator: atLeastOneEntry }]}>
      {(fields, { add, remove }, { errors }) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {label}
          {fields.map(({ key, name }) => {
            const formItemName: (string | number)[] = [name];

            if (item.name) {
              formItemName.push(item.name);
            }

            return (
              <Space key={key} align="baseline">
                <Form.Item {...item} name={formItemName}>
                  {children}
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            );
          })}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              {addButtonLabel}
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </Space>
      )}
    </Form.List>
  );
}
