/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ITransport, TLevel } from '../../logger.js';

interface IDestination {
  level: TLevel | 'all';
  file: string;
}

interface IOptions {
  destinations: IDestination[];
  timeout: {
    close: number;
  };
}

export function fileTransport(options: IOptions): ITransport {}
