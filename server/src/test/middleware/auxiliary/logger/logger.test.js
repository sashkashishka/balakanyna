import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../helpers/getTestServer.js';
import { Logger } from '../../../../utils/logger/logger.js';
import { loggerMiddleware } from '../../../../middleware/auxiliary/logger/middleware.js';

describe('[middleware] logger', async () => {
  test('should log and proceed to next middleware', async (t) => {
    const url = `/${Date.now()}`;
    const prefix = 'test';
    const handle = t.mock.fn();
    const logger = new Logger({
      enabled: true,
      prefix,
      transport: { handle },
    });
    const { request } = await getTestServer({
      t,
      deps: { logger },
      connectMiddleware(router) {
        router.use(loggerMiddleware);
      },
    });

    await request(url, { method: 'get' });

    // request logger
    assert.equal(handle.mock.calls[1].arguments[0], 'log');
    assert.deepEqual(handle.mock.calls[1].arguments[1].req, {
      method: 'GET',
      url,
      msg: 'incoming request',
    });

    // response logger
    assert.equal(handle.mock.calls[2].arguments[0], 'log');
    assert.deepEqual(handle.mock.calls[2].arguments[1].res, {
      val: { error: 'NOT_FOUND', message: 'Not Found' },
      code: 404,
    });

    assert.equal(
      handle.mock.calls[1].arguments[1].req.reqId,
      handle.mock.calls[2].arguments[1].res.reqId,
      'reqId should be equal for req and res log entities',
    );
  });
});
