import type { IRoutesConfig } from '@/core/router/types.ts';

export const ALIASES = {
  HOME: 'HOME',
  PROGRAM: 'PROGRAM',
  TASK: 'TASK',
};

export const ROUTES: IRoutesConfig = {
  [ALIASES.HOME]: '/',
  [ALIASES.PROGRAM]: '/program/:pid',
  [ALIASES.TASK]: '/program/:pid/:tid',
};
