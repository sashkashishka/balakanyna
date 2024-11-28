import type { ILabel } from './label';

export interface IImageEntry {
  id: number;
  filename: string;
  hashsum: string;
  path: string;
}

export interface IImage extends IImageEntry {
  labels: ILabel[];
  createdAt: string;
  updatedAt: string;
}