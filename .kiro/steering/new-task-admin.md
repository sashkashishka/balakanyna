# New Task — Admin Area Integration Guide

## 1. Config Form (`admin/src/components/TaskForm/tasks/<MyTask>ConfigForm.tsx`)

Create a new file following the pattern of existing config forms.

### Non-image task (e.g. `SchulteTableConfigForm`)
```tsx
import { useEffect, useMemo } from 'react';
import { Row, Col, Form, Input, Button, type FormInstance } from 'antd';
import type { TTask } from 'shared/types/task';
import type { ITaskFormProps } from '../TaskForm';
import { safeLS } from '@/utils/storage';

type TMyTask = Extract<TTask, { type: 'myTask' }>;

interface IProps extends Pick<ITaskFormProps, 'action'> {
  form: FormInstance<any>;
  initialValues?: Partial<TMyTask>;
  onFinish(v: unknown): Promise<boolean>;
}

export function MyTaskConfigForm({ form, initialValues, onFinish, action }: IProps) {
  const formName = 'my-task-config-form';
  const LS_KEY = `${action}:${formName}`;

  const defaultValues = useMemo(
    () => ({ ...initialValues, ...(action === 'create' && safeLS.getItem(LS_KEY)), type: 'myTask' }),
    [initialValues],
  );

  useEffect(() => { form.setFieldsValue(defaultValues); }, [form, defaultValues]);

  return (
    <Form
      form={form}
      name={formName}
      initialValues={defaultValues}
      onFinish={async (values) => {
        const result = await onFinish(values);
        if (result) safeLS.removeItem(LS_KEY);
      }}
      autoComplete="off"
      layout="vertical"
      onValuesChange={(_, values) => safeLS.setItem(LS_KEY, values)}
    >
      <Row gutter={24}>
        <Form.Item<TMyTask> name="id" hidden><Input /></Form.Item>
        {/* type field */}
        <Col span={24}>
          <Form.Item<TMyTask> label="Task type" name="type"><Input disabled /></Form.Item>
        </Col>
        {/* name field */}
        <Col span={24}>
          <Form.Item<TMyTask> label="Task name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Alice task 1" />
          </Form.Item>
        </Col>
        {/* config fields ... */}
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
```

### Image task additions
For tasks with images, add a `prepareBody` function that strips image objects down to `{ id }` before submission (the server only accepts `uploadImageSchema`):
```tsx
function prepareBody(body: TMyTask) {
  body.config.items = body.config.items.map(({ image }) => ({ image: { id: image.id } }));
  return body;
}
// then in onFinish: await onFinish(prepareBody(values))
```

Also normalize `initialValues` to include full image fields (`id`, `filename`, `hashsum`, `path`) for display, and use `SortableFormList` + `ImageField` + `ImageSelector` components (see `ImageSliderConfigForm` for the full pattern).

---

## 2. Register in `TaskForm.tsx` (`admin/src/components/TaskForm/TaskForm.tsx`)

```tsx
import { MyTaskConfigForm } from './tasks/MyTaskConfigForm';

const TASK_FORMS = {
  // ...existing,
  myTask: MyTaskConfigForm,
};
```

---

## 3. Register Validator in `utils.ts` (`admin/src/components/TaskForm/utils.ts`)

```ts
import { myTaskSchema } from 'shared/schemas/myTask';
// For image tasks use the full schema:
import { fullMyTaskSchema } from 'shared/schemas/myTask';

export const CONFIG_VALIDATOR_MAP: Record<TTaskType, ValidateFunction> = {
  // ...existing,
  myTask: ajv.compile(myTaskSchema), // or fullMyTaskSchema
};
```

The validator controls whether the live preview renders. It must pass for the `TaskPreview` component to mount.

---

## 4. Register in `TaskPreview.tsx` (`admin/src/components/TaskPreview/TaskPreview.tsx`)

```tsx
import { MyTask } from 'client'; // or MyTaskPreview if the task exports a separate preview component

const TASK_MAP: Record<TTaskType, () => JSX.Element> = {
  // ...existing,
  myTask: MyTask,
};
```

The `TaskPreview` component uses `solid-js/web`'s `render` + `createComponent` to mount the SolidJS component inside a React tree. No extra wiring needed — just add the entry to `TASK_MAP`.

---

## Key Invariants

- `TASK_FORMS`, `CONFIG_VALIDATOR_MAP`, and `TASK_MAP` must all have an entry for the new task type — missing any one will cause the form or preview to silently not render.
- The form's `type` field must be set to the exact task type string (e.g. `'myTask'`) in `defaultValues` so it is included in the submitted payload.
- `safeLS` (localStorage) is used to persist draft form state between page loads. Always use `LS_KEY = \`${action}:${formName}\`` and clear it on successful submit.
- Image config forms must call `prepareBody` before `onFinish` — the server rejects full image objects on create/update (only `{ id }` is accepted per `uploadImageSchema`).
