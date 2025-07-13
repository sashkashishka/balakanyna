import { eq } from 'drizzle-orm';

import { Composer } from '../../../../../core/composer.js';
import { ERR_INVALID_PAYLOAD } from '../../../../../core/errors.js';
import { createValidateBodyMiddleware } from '../../../../auxiliary/validate/middleware.js';
import { programTable, programTaskTable } from '../../../../../db/schema.js';

import { checkIfProgramExistsMiddleware } from '../update/middleware.js';
import { programDeleteBodySchema } from './schema.js';

/**
 * @argument {import('../../../../../core/context.js').Context} ctx
 */
async function deleteProgramMiddleware(ctx) {
  const body = ctx.body;

  const result = await ctx.db.transaction(
    async function deleteProgramTransaction(tx) {
      try {
        await tx
          .delete(programTaskTable)
          .where(eq(programTaskTable.programId, body.id));

        await tx.delete(programTable).where(eq(programTable.id, body.id));

        return 'ok';
      } catch (err) {
        ctx.logger.error({
          err,
          place: '[deleteProgramTransaction]',
        });
        tx.rollback();
        return err;
      }
    },
  );

  ctx.json({
    id: body.id,
    result,
  });
}

export const method = 'delete';
export const route = '/api/admin/program/delete';

export const middleware = Composer.compose([
  createValidateBodyMiddleware(programDeleteBodySchema, ERR_INVALID_PAYLOAD),
  checkIfProgramExistsMiddleware,
  deleteProgramMiddleware,
]);
