import type { TTask } from './task';

export interface IProgram {
  id: number;
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
