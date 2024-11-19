import { eq } from 'drizzle-orm';

import { Composer } from '../../../../core/composer.js';
import { ERR_NOT_FOUND } from '../../../../core/errors.js';
import { adminTable } from '../../../../db/schema.js';

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function getAdminMiddleware(ctx) {
  const { payload } = await ctx.jwt.verify(ctx.cookie.getCookie('token'));

  const [result] = await ctx.db
    .select()
    .from(adminTable)
    .where(eq(adminTable.id, payload?.id));

  if (!result) {
    throw new ERR_NOT_FOUND();
  }

  ctx.json({
    id: result.id,
    name: result.name,
  });
}

export const method = 'get';
export const route = '/api/admin/get';

export const middleware = Composer.compose([getAdminMiddleware]);
