import { useStore } from '@nanostores/react';

import { $router, ROUTE_ALIAS } from '../stores/router';
import { $admin, $isLoggedIn } from '../stores/auth';
import { AuthLayout } from '../components/Layouts/Auth';
import { LoginPage } from './Login/Login';
import { RegistrationPage } from './Registration/Registration';
import { PanelLayout } from '../components/Layouts/Panel';
import { UserListPage } from './UserList';

export function Router() {
  const router = useStore($router);
  const admin = useStore($admin);
  const isLoggedIn = useStore($isLoggedIn);

  if (admin.loading) {
    return null;
  }

  if (!isLoggedIn) {
    let content = <LoginPage />;

    if (router?.route === ROUTE_ALIAS.REGISTRATION) {
      content = <RegistrationPage />;
    }

    return <AuthLayout>{content}</AuthLayout>;
  }

  // regular routes
  return (
    <PanelLayout>
      <PrivateRouter />
    </PanelLayout>
  );
}

export function PrivateRouter() {
  const router = useStore($router);

  switch (router?.route) {
    case ROUTE_ALIAS.HOME: {
      return 'home';
    }
    case ROUTE_ALIAS.USER_LIST: {
      return <UserListPage />;
    }
    default:
      return 'not found';
  }
}
