import process from 'node:process';
import { format } from 'node:util';

export class Logger {
  #debug = false;

  #prefix = '';
  #transport = undefined;

  constructor({ prefix, transport }) {
    this.#prefix = prefix;
    this.#debug = process.env.DEBUG !== '1';
    // TODO: refactor it to use other approach for logging
    this.#transport = transport || console;
  }

  #handle(level, ...args) {
    if (!this.#debug) return;

    return this.#transport[level](format(this.#prefix, ...args, '\n'));
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
