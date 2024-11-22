import { useStore } from '@nanostores/react';
import { $router } from '@/stores/router';
import { UserForm } from '../common/UserForm';

export function UserCreatePage() {
  const router = useStore($router);

  return <UserForm initialValues={{}} action="create" />;
}
