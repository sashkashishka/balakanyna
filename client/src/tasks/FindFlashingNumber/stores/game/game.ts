import { createStore } from 'solid-js/store';

import type { TTask } from 'shared/types/task.ts';

import type { IGameState, IGlobalState, IStreak } from '../../types.ts';
import { getInitialState, getNextGame } from './utils.ts';

interface IOptions {
  config: Extract<TTask, { type: 'findFlashingNumber' }>['config'];
  globalStore: IGlobalState;
  addScore(v: number): void;
  addStreak(streak: IStreak): void;
}

export function useGameStore({
  config,
  globalStore,
  addScore,
  addStreak,
}: IOptions) {
  const [gameStore, setGameStore] = createStore<IGameState>(
    getInitialState(config, globalStore),
  );

  function decTimer() {
    setGameStore('timer', (timer) => Math.max(0, timer - 1));
  }

  function nextGame() {
    const { field, searchNumber, animationDuration, color } = getNextGame({
      streak: globalStore.streak,
      config,
    });

    setGameStore('field', field!);
    setGameStore('searchNumber', searchNumber!);
    setGameStore('animationDuration', animationDuration!);
    setGameStore('color', color!);
  }

  function pickNumber(n: number) {
    const result = gameStore.searchNumber === n;

    addStreak({ result });
    addScore(Number(result));

    // TODO: delay execution
    nextGame();
  }

  return {
    gameStore,
    decTimer,
    nextGame,
    pickNumber,
  };
}
