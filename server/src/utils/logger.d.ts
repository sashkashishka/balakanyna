/* eslint-disable @typescript-eslint/no-explicit-any */
interface IOptions {
  prefix: string;
}

export class Logger {
  constructor(options): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}
