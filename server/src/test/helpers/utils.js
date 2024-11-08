import * as login from '../../middleware/api/admin/login.js';

export async function getAuthCookie(request, admin) {
  const resp = await request(login.route, {
    method: login.method,
    body: admin,
  });

  return resp.headers.get('set-cookies');
}
