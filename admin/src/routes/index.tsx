import { useStore } from '@nanostores/react';

import { $router, ROUTE_ALIAS } from '@/stores/router';
import { $admin, $isLoggedIn } from '@/stores/auth';
import { AuthLayout } from '@/components/Layouts/Auth';
import { PanelLayout } from '@/components/Layouts/Panel';

import { LoginPage } from './Login/Login';
import { RegistrationPage } from './Registration/Registration';
import { UserListPage } from './User/List';
import { UserCreatePage } from './User/Create';
import { UserViewPage } from './User/View';

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
    case ROUTE_ALIAS.USER_CREATE: {
      return <UserCreatePage />;
    }
    case ROUTE_ALIAS.USER_VIEW:
    case ROUTE_ALIAS.USER_VIEW_PROGRAMS:
    case ROUTE_ALIAS.USER_VIEW_TASKS: {
      return <UserViewPage />;
    }
    default:
      return 'not found';
  }
}
