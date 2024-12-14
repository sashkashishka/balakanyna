/* eslint-disable @typescript-eslint/no-explicit-any */
interface IOptions {
  enabled: boolean;
  prefix: string;
  metadata?: Record<string, any>;
  transport?: ITransport;
}

type TLevel = 'log' | 'error' | 'trace';

interface ILogEntity {
  message?: string;
  [key: string]: any;
}

export interface ITransport {
  handle(level: TLevel, message: string): void;
}

export class Logger {
  constructor(options): void;
  clone(metadata: IOptions['metadata']): Logger;
  log(entity: ILogEntity): void;
  warn(entity: ILogEntity): void;
  error(entity: ILogEntity): void;
}
