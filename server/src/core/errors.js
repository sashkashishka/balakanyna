import { format } from 'node:util';

export function createError(code, message, statusCode = 500, Base = Error) {
  class ServerError extends Base {
    constructor(...args) {
      super(...args);

      this.code = code;
      this.name = 'ServerError';
      this.statusCode = statusCode;

      this.message = format(message, ...args);
    }
  }

  return ServerError;
}

export const ERR_NOT_FOUND = createError('NOT_FOUND', 'Not Found', 404);

export const ERR_FAILED_SERIALIZATION = createError(
  'FAILED_SERIALIZATION',
  'Failed serialization \n %s',
  500,
  TypeError,
);

export const ERR_FILE_STREAM_ERROR = createError(
  'FILE_STREAM_ERROR',
  'File stream error',
  500,
);

export const ERR_UNAUTHORIZED = createError(
  'UNAUTHORIZED',
  'Unauthorized',
  401,
);

export const ERR_FORBIDDEN = createError('FORBIDDEN', 'Forbidden', 403);

export const ERR_INVALID_PAYLOAD = createError(
  'INVALID_PAYLOAD',
  'Invalid payload',
  400,
);
