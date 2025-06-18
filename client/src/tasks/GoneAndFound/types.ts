export interface IStreak {
  result: boolean;
}

export interface IGlobalState {
  screen: 'start' | 'game' | 'finish';
  score: number;
  streak: IStreak[];
}

export interface ICell {
  item: string; // image
  disappear: boolean;
}

export interface IGameState {
  limitType: 'rounds' | 'timer';
  rounds: {
    current: number;
    total: number;
  };
  phase: 'remember' | 'find';
  timer: number;
  field: ICell[];
  pickingBoard: ICell[];
  dimensions: {
    x: number;
    y: number;
  };
  proceedType: 'fail' | 'success' | null;
}

export type TItemPreset = 'default';
export type TItemPresets = Record<
  TItemPreset,
  [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ]
>;
