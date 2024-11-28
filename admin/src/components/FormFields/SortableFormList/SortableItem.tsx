import { DragOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Flex, Space } from 'antd';
import type { ReactNode } from 'react';

interface IProps {
  id: number;
  children: ReactNode;
}

export function SortableItem({ id, children }: IProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <Flex
      ref={setNodeRef}
      align="top"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Space size="large" align="baseline">
        {children}

        <Button icon={<DragOutlined />} {...listeners} {...attributes} />
      </Space>
    </Flex>
  );
}
