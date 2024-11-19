import { useStore } from '@nanostores/react';

import { $router } from '../stores/router';
import { $admin, $isLoggedIn } from '../stores/auth';
import { AuthLayout } from '../components/Layouts/Auth';
import { LoginPage } from './Login/Login';
import { RegistrationPage } from './Registration/Registration';

export function Router() {
  const router = useStore($router);
  const admin = useStore($admin);
  const isLoggedIn = useStore($isLoggedIn);

  if (admin.loading) {
    return null;
  }

  if (!isLoggedIn) {
    let content = <LoginPage />;

    if (router?.route === 'registration') {
      content = <RegistrationPage />;
    }

    return <AuthLayout>{content}</AuthLayout>;
  }

  // regular routes
  return null;
}
