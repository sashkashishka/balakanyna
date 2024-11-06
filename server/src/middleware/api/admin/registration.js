import { count, eq } from 'drizzle-orm';

import { adminTable } from '../../../db/schema.js';
import { ERR_INVALID_PAYLOAD, createError } from '../../../core/errors.js';
import { Composer } from '../../../core/composer.js';
import { encryptPassword } from '../../../utils/encryptPassword.js';

const ERR_DUPLICATE_USER = createError(
  'DUPLICATE_USER',
  'Cannot create user that is already exist',
  400,
);

/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
function validatePayloadMiddleware(ctx, next) {
  const body = ctx.body;

  if (
    body &&
    body?.name &&
    typeof body?.name === 'string' &&
    body?.password &&
    typeof body?.password === 'string'
  ) {
    return next();
  }

  throw new ERR_INVALID_PAYLOAD();
}

/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateAdminMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(adminTable.id) })
    .from(adminTable)
    .where(eq(adminTable.name, body.name));

  if (result.count > 0) {
    throw new ERR_DUPLICATE_USER();
  }

  return next();
}

/**
 * @argument {import('../../../core/context.js').Context} ctx
 */
async function registrationMiddleware(ctx) {
  const body = ctx.body;

  const admin = {
    name: body.name,
    password: encryptPassword(body.password, ctx.config.salt.password),
  };

  const [result] = await ctx.db.insert(adminTable).values(admin).returning();

  ctx.json({
    id: result.id,
    name: result.name,
  });
}

export const route = '/api/admin/registration';

export const middleware = Composer.compose([
  validatePayloadMiddleware,
  checkIfDuplicateAdminMiddleware,
  registrationMiddleware,
]);
