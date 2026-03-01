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

  LABEL_LIST: 'label-list',

  IMAGE_LIST: 'image-list',

  TASK_LIST: 'task-list',
};

function generateRoute(route: string) {
  const base = import.meta.env.PROD ? '/admin' : '';

  return new URL(base + route, 'http://a').pathname;
}

export const $router = createRouter({
  [ROUTE_ALIAS.HOME]: generateRoute('/'),
  [ROUTE_ALIAS.REGISTRATION]: generateRoute('/registration'),
  [ROUTE_ALIAS.LOGIN]: generateRoute('/login'),

  [ROUTE_ALIAS.USER_LIST]: generateRoute('/user/list'),
  [ROUTE_ALIAS.USER_VIEW]: generateRoute('/user/view/:uid'),
  [ROUTE_ALIAS.USER_VIEW_PROGRAMS]: generateRoute('/user/view/:uid/programs'),
  [ROUTE_ALIAS.USER_VIEW_TASKS]: generateRoute('/user/view/:uid/tasks'),

  [ROUTE_ALIAS.PROGRAM_LIST]: generateRoute('/program/list'),

  [ROUTE_ALIAS.LABEL_LIST]: generateRoute('/label/list'),

  [ROUTE_ALIAS.IMAGE_LIST]: generateRoute('/image/list'),

  [ROUTE_ALIAS.TASK_LIST]: generateRoute('/task/list'),
});

export const ROUTE_TITLE = {
  [ROUTE_ALIAS.HOME]: 'Home',

  [ROUTE_ALIAS.USER_LIST]: 'User list',
  [ROUTE_ALIAS.USER_VIEW]: 'Info',
  [ROUTE_ALIAS.USER_VIEW_PROGRAMS]: 'Programs',
  [ROUTE_ALIAS.USER_VIEW_TASKS]: 'Tasks',

  [ROUTE_ALIAS.PROGRAM_LIST]: 'Program list',

  [ROUTE_ALIAS.LABEL_LIST]: 'Label list',

  [ROUTE_ALIAS.IMAGE_LIST]: 'Image list',

  [ROUTE_ALIAS.TASK_LIST]: 'Task list',
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

export function openUserProgramView(uid: string) {
  // @ts-expect-error something with router types
  openPage($router, ROUTE_ALIAS.USER_VIEW_PROGRAMS, { uid });
}
export function openProgramList() {
  openPage($router, ROUTE_ALIAS.PROGRAM_LIST);
}
export function openLabelList() {
  openPage($router, ROUTE_ALIAS.LABEL_LIST);
}
export function openImageList() {
  openPage($router, ROUTE_ALIAS.IMAGE_LIST);
}
export function openTaskList() {
  openPage($router, ROUTE_ALIAS.TASK_LIST);
}
