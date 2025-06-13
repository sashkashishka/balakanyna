import { createStore } from 'solid-js/store';

import type { TTask } from 'shared/types/task.ts';
import { random } from '@/utils/random.ts';

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
    // 1. receive global state
    // 2. calculate field.x, field.y, number.min, number.max (make sure that number is always in the same place value:
    //    10-99, 100-999, or 1000-9999)
    //
    //    2.1. it depends on the streak. let's take into consideration length of the streak. if the
    //         successfull streak has N length, then use maximum values, if all unsuccessfull - use minimum values
    //         apply easing function to make it non linear. also, make configurable the length of the streak and easing function
    //         (but do not include it to config)
    //
    // 3. generate field with specified numbers
    // 4. randomly pick the number to search

    const { field, searchNumber, animationDuration } = getNextGame({
      streak: globalStore.streak,
      config,
    });

    setGameStore('field', field!);
    setGameStore('searchNumber', searchNumber!);
    setGameStore('animationDuration', animationDuration!);
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
