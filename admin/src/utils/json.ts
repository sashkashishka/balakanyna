import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';

export function safeParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function getAjv() {
  const ajv = new Ajv({ coerceTypes: true });

  addFormats(ajv);

  return ajv;
}
