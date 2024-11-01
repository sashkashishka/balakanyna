import process, { stderr, stdout } from 'node:process';
import { format } from 'node:util';

class StandartTransport {
  handle(level, message) {
    switch (level) {
      case 'error':
      case 'warn': {
        return stderr.write(message);
      }

      case 'log':
      default: {
        return stdout.write(message);
      }
    }
  }
}

export class Logger {
  #debug = false;

  #prefix = '';
  #transport = undefined;

  constructor({ prefix, transport }) {
    this.#prefix = prefix;
    this.#debug = process.env.DEBUG === '1';
    this.#transport = transport || new StandartTransport();
  }

  #handle(level, ...args) {
    if (!this.#debug) return;

    return this.#transport.handle(level, format(this.#prefix, ...args, '\n'));
  }

  log(...args) {
    this.#handle('log', ...args);
  }

  error(...args) {
    this.#handle('error', ...args);
  }

  warn(...args) {
    this.#handle('warn', ...args);
  }
}
