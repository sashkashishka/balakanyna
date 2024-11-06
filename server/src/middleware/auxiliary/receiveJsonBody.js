import { hasJsonBody, jsonParse, receiveBody } from '../../utils/network.js';

export async function receiveJsonBodyMiddleware(ctx, next) {
  if (hasJsonBody(ctx.req)) {
    const body = await receiveBody(ctx.req);

    ctx.body = jsonParse(body);
  }

  return next();
}
