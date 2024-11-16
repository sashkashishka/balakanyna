import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../core/composer.js';
import { createError } from '../../../../core/errors.js';
import { adminTable } from '../../../../db/schema.js';
import { encryptPassword } from '../../../../utils/encryptPassword.js';
import { createValidateBodyMiddleware } from '../../../auxiliary/validate/middleware.js';

import schema from './schema.json' with { type: 'json' };

const ERR_WRONG_CREDENTIALS = createError(
  'WRONG_CREDENTIALS',
  'Wrong credentials',
  400,
);

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function checkIfUserExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(adminTable.id) })
    .from(adminTable)
    .where(eq(adminTable.name, body.name))
    .limit(1);

  if (result.count === 0) {
    throw new ERR_WRONG_CREDENTIALS();
  }

  return next();
}

/**
 * @argument {import('../../../../core/context.js').Context} ctx
 */
async function loginMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select()
    .from(adminTable)
    .where(eq(adminTable.name, body.name));

  if (
    result?.password !==
    encryptPassword(body.password, ctx.config.salt.password)
  ) {
    throw new ERR_WRONG_CREDENTIALS();
  }

  const admin = {
    id: result.id,
    name: result.name,
  };

  const token = await ctx.jwt.sign(admin);

  ctx.cookie.setCookie(ctx.config.jwt.cookie, token, {
    httpOnly: true,
  });

  ctx.json(admin);
}

export const method = 'post';
export const route = '/api/admin/login';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_WRONG_CREDENTIALS),
  checkIfUserExistsMiddleware,
  loginMiddleware,
]);
