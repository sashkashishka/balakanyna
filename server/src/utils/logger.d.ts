/* eslint-disable @typescript-eslint/no-explicit-any */
interface IOptions {
  prefix: string;
  transport?: ITransport;
}

type TLevel = 'log' | 'error' | 'trace';

interface ITransport {
  handle(level: TLevel, message: string): void;
}

export class Logger {
  constructor(options): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}
