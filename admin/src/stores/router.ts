import { createRouter, getPagePath, openPage } from '@nanostores/router';

export const $router = createRouter({
  home: '/',
  registration: '/registration',
  login: '/login',
});

export const ROUTES = {
  registartion() {
    return getPagePath($router, 'registration');
  },
  login() {
    return getPagePath($router, 'login');
  },
};

export function openLogin() {
  openPage($router, 'login');
}

export function openHome() {
  openPage($router, 'home');
}
