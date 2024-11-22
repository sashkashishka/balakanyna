import { count, eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import {
  createError,
  ERR_INVALID_PAYLOAD,
  ERR_NOT_FOUND,
} from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTable } from '../../../../../db/schema.js';

import schema from './schema.json' with { type: 'json' };

const ERR_DATES_COMPLIANCE = createError(
  'DATES_COMPLIANCE',
  'Dates compliance',
  400,
);

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function checkIfProgramExistsMiddleware(ctx, next) {
  const body = ctx.body;

  const [result] = await ctx.db
    .select({ count: count(programTable.id) })
    .from(programTable)
    .where(eq(programTable.id, body.id))
    .limit(1);

  if (result?.count === 0) {
    throw new ERR_NOT_FOUND();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
function verifyStartAndExpirationDatetimeComplianceMiddleware(ctx, next) {
  const body = ctx.body;

  const start = new Date(body.startDatetime);
  const expiration = new Date(body.expirationDatetime);

  if (start >= expiration) {
    throw new ERR_DATES_COMPLIANCE();
  }

  return next();
}

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function updateProgramMiddleware(ctx) {
  const body = ctx.body;

  const [result] = await ctx.db
    .update(programTable)
    .set({
      name: body.name,
      startDatetime: body.startDatetime,
      expirationDatetime: body.expirationDatetime,
    })
    .where(eq(programTable.id, body.id))
    .returning();

  ctx.json({
    id: result.id,
    name: result.name,
    startDatetime: result.startDatetime,
    expirationDatetime: result.expirationDatetime,
    userId: result.userId,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
}

export const method = 'patch';
export const route = '/api/admin/program/update';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(schema, ERR_INVALID_PAYLOAD),
  checkIfProgramExistsMiddleware,
  verifyStartAndExpirationDatetimeComplianceMiddleware,
  updateProgramMiddleware,
]);
