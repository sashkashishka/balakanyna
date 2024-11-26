import type { ILabel } from './label';

export interface IImage {
  id: number;
  filename: string;
  hashsum: string;
  path: string;
  labels: ILabel[];
  createdAt: string;
  updatedAt: string;
}
