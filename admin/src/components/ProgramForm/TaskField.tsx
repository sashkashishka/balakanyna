import type { TTask } from 'shared/types/task';
import { Space, Button } from 'antd';
import { UpdateTaskDrawer } from '../UpdateTaskDrawer';

interface IProps {
  value?: TTask;
  onChange?(v: TTask): void;
}
export function TaskField({ value }: IProps) {
  if (!value) {
    return 'no task';
  }

  return (
    <Space style={{ width: '550px', overflow: 'hidden' }}>
      <UpdateTaskDrawer
        taskId={value.id}
        children={<Button type="link">{value.id}</Button>}
      />
      <div style={{ width: '140px' }}>{value.type}</div>
      <div>{value.name}</div>
    </Space>
  );
}
