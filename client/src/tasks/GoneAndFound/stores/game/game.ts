import { createStore } from 'solid-js/store';

import type { TTask } from 'shared/types/task.ts';

import type { IGameState, IGlobalState, IStreak } from '../../types.ts';
import { getInitialState, getNextGame } from './utils.ts';

interface IOptions {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
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

  function incRound() {
    setGameStore('rounds', ['current'], (curr) => curr + 1);
  }

  function nextPhase() {
    switch (gameStore.phase) {
      case 'remember': {
        setGameStore('phase', 'find');
        break;
      }
    }
  }

  function nextGame() {
    const { field, dimensions, pickingBoard } = getNextGame({
      streak: globalStore.streak,
      config,
    });

    addStreak({ result: gameStore.proceedType === 'success' });
    setGameStore('field', field!);
    setGameStore('dimensions', dimensions!);
    setGameStore('pickingBoard', pickingBoard!);
    setGameStore('phase', 'remember');
    setGameStore('proceedType', null);
  }

  function pickItem(item: string) {
    console.log(gameStore.field, item);
    const cellIdx = gameStore.field.findIndex((v) => v?.item === item)!;
    const cell = gameStore.field[cellIdx]!;

    if (cell?.disappear) {
      setGameStore('field', [cellIdx], (cell) => ({
        ...cell,
        disappear: false,
      }));
      addScore(1);

      const finish = gameStore.field.every((c) => !c?.disappear);

      if (finish) {
        setGameStore('proceedType', 'success');
      }
    } else {
      setGameStore('proceedType', 'fail');
    }
  }

  return {
    gameStore,
    decTimer,
    nextGame,
    incRound,
    pickItem,
    nextPhase,
  };
}
