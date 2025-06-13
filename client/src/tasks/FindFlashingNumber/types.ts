export interface IStreak {
  result: boolean;
}

export interface IGlobalState {
  screen: 'start' | 'game' | 'finish';
  score: number;
  streak: IStreak[];
  lives: number; // make it infinity for the first time
}

export interface ICell {
  number: number;
  animation: string;
  color: string;
}

export interface IGameState {
  timer: number;
  field: ICell[][];
  searchNumber: number;
  animationDuration: number;
  color: string;
}
