import { type ReactNode } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Button } from 'antd';
import type { FormItemProps } from 'antd/es/form';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';

import { atLeastOneEntry } from './validators';
import { SortableItem } from './SortableItem';

interface IProps<T extends (string | number)[]> {
  name: T;
  item: FormItemProps;
  label: ReactNode;
  wrapWithField?: boolean;
  addButton?: ReactNode;
  children:
    | ReactNode
    | ((options: { index: number }) => ReactNode);
}

export function SortableFormList<T extends (string | number)[]>({
  name,
  item,
  label,
  addButton,
  wrapWithField = true,
  children,
}: IProps<T>) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        distance: 10,
      },
    }),
  );

  return (
    <Form.List name={name} rules={[{ validator: atLeastOneEntry }]}>
      {(fields, { add, remove, move }, { errors }) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {label}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (active.id !== over?.id) {
                const from = fields.findIndex(
                  (field) => field.key === active.id,
                );
                const to = fields.findIndex((field) => field.key === over!.id);
                move(from, to);
              }
            }}
          >
            <SortableContext
              items={fields.map((v) => ({ id: v.key, ...v }))}
              strategy={rectSortingStrategy}
            >
              {fields.map(({ key, name }) => {
                const formItemName = [name];

                if (item.name) {
                  formItemName.push(item.name);
                }

                const result =
                  typeof children === 'function'
                    ? children({ index: name })
                    : children;

                return (
                  <SortableItem key={key} id={key}>
                    {wrapWithField ? (
                      <Form.Item {...item} name={formItemName}>
                        {result}
                      </Form.Item>
                    ) : (
                      result
                    )}
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>

          <Form.Item>
            {addButton || (
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add
              </Button>
            )}
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </Space>
      )}
    </Form.List>
  );
}
