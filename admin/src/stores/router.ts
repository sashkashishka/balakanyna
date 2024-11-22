import { createRouter, getPagePath, openPage } from '@nanostores/router';

export const ROUTE_ALIAS = {
  HOME: 'home',
  REGISTRATION: 'registration',
  LOGIN: 'login',
  USER_LIST: 'user-list',
  USER_VIEW: 'user-view',
  USER_CREATE: 'user-create',
};

export const $router = createRouter({
  [ROUTE_ALIAS.HOME]: '/',
  [ROUTE_ALIAS.REGISTRATION]: '/registration',
  [ROUTE_ALIAS.LOGIN]: '/login',
  [ROUTE_ALIAS.USER_LIST]: '/user/list',
  [ROUTE_ALIAS.USER_VIEW]: '/user/view/:id',
  [ROUTE_ALIAS.USER_CREATE]: '/user/create',
});

export const ROUTE_TITLE = {
  [ROUTE_ALIAS.HOME]: 'Home',
  [ROUTE_ALIAS.USER_LIST]: 'User list',
  [ROUTE_ALIAS.USER_CREATE]: 'User create',
};

export const ROUTES = {
  home() {
    return getPagePath($router, ROUTE_ALIAS.HOME);
  },
  registartion() {
    return getPagePath($router, ROUTE_ALIAS.REGISTRATION);
  },
  login() {
    return getPagePath($router, ROUTE_ALIAS.LOGIN);
  },
  userList() {
    return getPagePath($router, ROUTE_ALIAS.USER_LIST);
  },
  userCreate() {
    return getPagePath($router, ROUTE_ALIAS.USER_CREATE);
  },
  userView(id: string) {
    // @ts-expect-error something with router types
    return getPagePath($router, ROUTE_ALIAS.USER_VIEW, { id });
  },
};

export function openLogin() {
  openPage($router, ROUTE_ALIAS.LOGIN);
}
export function openHome() {
  openPage($router, ROUTE_ALIAS.HOME);
}
export function openUserList() {
  openPage($router, ROUTE_ALIAS.USER_LIST);
}
export function openUserCreate() {
  openPage($router, ROUTE_ALIAS.USER_CREATE);
}
