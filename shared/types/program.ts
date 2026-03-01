import type { TTask } from './task.ts';

export interface IProgram {
  id: number;
  hash: string;
  name: string;
  userId: number;
  startDatetime: string;
  expirationDatetime: string;
  updatedAt: string;
  createdAt: string;
}

export interface IProgramFull extends IProgram {
  tasks: TTask[];
}

export interface IProgramBody extends IProgram {
  tasks?: Array<{ taskId: number }>;
}

// eslint-disable-next-line
export interface IProgramCopy
  extends Pick<
    IProgram,
    'id' | 'userId' | 'expirationDatetime' | 'startDatetime'
  > {}
