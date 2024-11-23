import {
  createRouter,
  getPagePath,
  openPage,
  redirectPage,
} from '@nanostores/router';

export const ROUTE_ALIAS = {
  HOME: 'home',
  REGISTRATION: 'registration',
  LOGIN: 'login',

  USER_LIST: 'user-list',
  USER_VIEW: 'user-view',
  USER_VIEW_PROGRAMS: 'user-view-programs',
  USER_VIEW_TASKS: 'user-view-tasks',

  PROGRAM_LIST: 'program-list',
  PROGRAM_VIEW: 'program-view',
};

export const $router = createRouter({
  [ROUTE_ALIAS.HOME]: '/',
  [ROUTE_ALIAS.REGISTRATION]: '/registration',
  [ROUTE_ALIAS.LOGIN]: '/login',

  [ROUTE_ALIAS.USER_LIST]: '/user/list',
  [ROUTE_ALIAS.USER_VIEW]: '/user/view/:uid',
  [ROUTE_ALIAS.USER_VIEW_PROGRAMS]: '/user/view/:uid/programs',
  [ROUTE_ALIAS.USER_VIEW_TASKS]: '/user/view/:uid/tasks',

  [ROUTE_ALIAS.PROGRAM_LIST]: '/program/list',
  [ROUTE_ALIAS.PROGRAM_VIEW]: '/program/view/:pid',
});

export const ROUTE_TITLE = {
  [ROUTE_ALIAS.HOME]: 'Home',

  [ROUTE_ALIAS.USER_LIST]: 'User list',
  [ROUTE_ALIAS.USER_VIEW]: 'Info',
  [ROUTE_ALIAS.USER_VIEW_PROGRAMS]: 'Programs',
  [ROUTE_ALIAS.USER_VIEW_TASKS]: 'Tasks',

  [ROUTE_ALIAS.PROGRAM_LIST]: 'Program list',
  [ROUTE_ALIAS.PROGRAM_VIEW]: 'Info',
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
  userView(uid: string) {
    // @ts-expect-error something with router types
    return getPagePath($router, ROUTE_ALIAS.USER_VIEW, { uid });
  },
  programView(pid: string) {
    // @ts-expect-error something with router types
    return getPagePath($router, ROUTE_ALIAS.PROGRAM_VIEW, { pid });
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openRoute(alias: string, options: any) {
  openPage($router, alias, options);
}
export function openLogin() {
  openPage($router, ROUTE_ALIAS.LOGIN);
}
export function openHome() {
  openPage($router, ROUTE_ALIAS.HOME);
}
export function openUserList() {
  openPage($router, ROUTE_ALIAS.USER_LIST);
}
export function redirectUserView(uid: string) {
  // @ts-expect-error something with router types
  redirectPage($router, ROUTE_ALIAS.USER_VIEW, { uid });
}
export function openUserView(uid: string) {
  // @ts-expect-error something with router types
  openPage($router, ROUTE_ALIAS.USER_VIEW, { uid });
}
export function redirectProgramView(pid: string) {
  // @ts-expect-error something with router types
  redirectPage($router, ROUTE_ALIAS.PROGRAM_VIEW, { pid });
}
export function openProgramView(pid: string) {
  // @ts-expect-error something with router types
  openPage($router, ROUTE_ALIAS.PROGRAM_VIEW, { pid });
}
