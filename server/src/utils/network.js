/**
 * @argument {import('node:http').IncomingMessage} req
 */
export function hasJsonBody(req) {
  if (req.writableEnded) return false;

  return req.headers['content-type'] === 'application/json';
}

export async function receiveBody(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function jsonParse(buffer) {
  if (buffer.length === 0) return null;
  try {
    return JSON.parse(buffer);
  } catch {
    return null;
  }
}
