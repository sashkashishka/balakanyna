import { type ReactNode } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Button, Space } from 'antd';
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

import { atLeastOneEntry } from '../../validators';
import { SortableItem } from './SortableItem';

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
                const formItemName: (string | number)[] = [name];

                if (item.name) {
                  formItemName.push(item.name);
                }

                return (
                  <SortableItem key={key} id={key}>
                    <Form.Item {...item} name={formItemName}>
                      {children}
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>

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
