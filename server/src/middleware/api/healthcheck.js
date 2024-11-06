export const method = 'get';
export const route = '/api/healthcheck';

/**
 * @argument {import('../../core/context.js').Context} ctx
 */
export async function middleware(ctx) {
  ctx.json({ health: 'OK' });
}
