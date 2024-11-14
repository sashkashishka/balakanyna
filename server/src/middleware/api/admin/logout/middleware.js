export const method = 'delete';
export const route = '/api/admin/logout';

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
export function middleware(ctx) {
  ctx.cookie.setCookie(ctx.config.jwt.cookie, '');

  ctx.json({ ok: true });
}
