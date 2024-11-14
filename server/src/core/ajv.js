import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';

export function getAjv() {
  const ajv = new Ajv({ coerceTypes: true });

  addFormats(ajv);

  return ajv;
}
