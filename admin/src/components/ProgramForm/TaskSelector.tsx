import { TaskSelectDrawer } from '@/components/TaskSelectDrawer';
import { type FormInstance } from 'antd';

interface IProps {
  name: string | string[];
  form: FormInstance;
}

export function TaskSelector({ form, name }: IProps) {
  return (
    <TaskSelectDrawer
      onSelect={(tasks) => {
        const currValue = form.getFieldValue(name) || [];

        form.setFieldValue(name, currValue.concat(tasks));
      }}
    />
  );
}
