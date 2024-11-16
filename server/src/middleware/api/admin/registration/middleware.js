import { count, eq } from 'drizzle-orm';

import { adminTable } from '../../../../db/schema.js';
import { ERR_INVALID_PAYLOAD, createError } from '../../../../core/errors.js';
import { Composer } from '../../../../core/composer.js';
import { encryptPassword } from '../../../../utils/encryptPassword.js';
import { createValidateBodyMiddleware } from '../../../auxiliary/validate/middleware.js';

import schema from './schema.json' with { type: 'json' };

const ERR_DUPLICATE_ADMIN = createError(
  'DUPLICATE_ADMIN',
  'Cannot create admin that is already exist',
  400,
);

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function checkIfDuplicateAdminMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(adminTable.id) })
    .from(adminTable)
    .where(eq(adminTable.name, body.name))
    .limit(1);

  if (result.count > 0) {
    throw new ERR_DUPLICATE_ADMIN();
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
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
    updatedAt: result.updatedAt,
    createdAt: result.createdAt,
  });
}

export const method = 'post';
export const route = '/api/admin/registration';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfDuplicateAdminMiddleware,
  registrationMiddleware,
]);
