import { Ajv } from 'ajv';

export function getAjv() {
  return new Ajv();
}
