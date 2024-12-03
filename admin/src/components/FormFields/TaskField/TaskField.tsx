import type { TTask } from 'shared/types/task';
import { TaskSelectDrawer } from '@/components/TaskSelectDrawer';
import { Space } from 'antd';

interface IProps {
  value?: TTask;
  onChange?(v: TTask): void;
}
export function TaskField({ value, onChange }: IProps) {
  if (value) {
    return (
      <Space style={{ width: '550px', overflow: 'hidden' }}>
        {value.id}
        {value.type}
        {value.name}
      </Space>
    );
  }

  return <TaskSelectDrawer onSelect={onChange} />;
}
