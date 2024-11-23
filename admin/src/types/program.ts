import type { TTask } from './task';

export interface IProgram {
  id: number;
  name: string;
  startDatetime: string;
  expirationDatetime: string;
  updatedAt: string;
  createdAt: string;
}

export interface IProgramFull extends IProgram {
  tasks: TTask[];
}
