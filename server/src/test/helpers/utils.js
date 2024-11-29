import * as login from '../../middleware/api/admin/login/middleware.js';

export async function getAuthCookie(request, admin) {
  const resp = await request(login.route, {
    method: login.method,
    body: admin,
  });

  return resp.headers.get('set-cookie');
}

export function sleep(timeout) {
  const { promise, resolve } = Promise.withResolvers();

  setTimeout(resolve, timeout);

  return promise;
}
