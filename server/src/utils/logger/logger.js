import { consoleTransport } from './transport/console/console.js';

export class Logger {
  #enabled = true;
  #prefix = '';
  #transport = undefined;
  #metadata = {};

  constructor({ enabled, prefix, transport, metadata }) {
    this.#enabled = enabled;
    this.#prefix = prefix;
    this.#metadata = metadata;
    this.#transport = transport || consoleTransport();
  }

  clone(metadata) {
    return new Logger({
      enabled: this.#enabled,
      prefix: this.#prefix,
      transport: this.#transport,
      metadata: metadata,
    });
  }

  #prepareEntity(level, entity) {
    entity.level = level;
    entity[this.#prefix] = true;
    entity.timestamp = new Date().toISOString();

    Object.keys(this.#metadata || {}).forEach((key) => {
      entity[key] = this.#metadata[key];
    });

    Object.keys(entity).forEach((key) => {
      const val = entity[key];

      if (val instanceof Error) {
        entity[key] = {
          name: val.name,
          message: val.message,
          stack: val.stack,
          cause: val.cause,
        };
      }
    });

    return entity;
  }

  #handle(level, entity) {
    if (!this.#enabled) return;
    return this.#transport.handle(level, this.#prepareEntity(level, entity));
  }

  log(entity) {
    this.#handle('log', entity);
  }

  error(entity) {
    this.#handle('error', entity);
  }

  warn(entity) {
    this.#handle('warn', entity);
  }
}
