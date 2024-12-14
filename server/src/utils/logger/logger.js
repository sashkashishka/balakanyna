import { consoleTransport } from './transport/console/console.js';
import { fileTransport } from './transport/file/file.js';

export class Logger {
  #enabled = true;
  #prefix = '';
  #transport = undefined;
  #metadata = {};

  /**
   * @argument {import('../../core/server.js').IConfig} config
   */
  static getTransport(config) {
    switch (config.logger.transport) {
      case 'file':
        return fileTransport({
          destinations: config.logger.destinations,
          timeout: {
            close: config.timeouts.worker,
          },
        });

      default:
        return consoleTransport();
    }
  }

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

  stop() {
    return this.#transport.stop();
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

  #write(level, entity) {
    if (!this.#enabled) return;
    return this.#transport.handle(level, this.#prepareEntity(level, entity));
  }

  log(entity) {
    this.#write('log', entity);
  }

  error(entity) {
    this.#write('error', entity);
  }

  warn(entity) {
    this.#write('warn', entity);
  }
}
