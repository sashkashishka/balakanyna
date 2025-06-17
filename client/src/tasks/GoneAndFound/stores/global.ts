import { createStore } from 'solid-js/store';

import type { IGlobalState, IStreak } from '../types.ts';

const defaultState: IGlobalState = {
  score: 0,
  screen: 'start',
  streak: [],
};

export function useGlobalStore(initialState = defaultState) {
  const [globalStore, setGlobalStore] = createStore<IGlobalState>(initialState);

  function addStreak(streak: IStreak) {
    setGlobalStore('streak', globalStore.streak.length, streak);
  }

  function nextScreen() {
    switch (globalStore.screen) {
      case 'start':
      case 'finish': {
        setGlobalStore('screen', 'game');
        break;
      }

      case 'game': {
        setGlobalStore('screen', 'finish');
        break;
      }
    }
  }

  function addScore(diff: IGlobalState['score']) {
    setGlobalStore('score', (score) => diff + score);
  }

  return {
    globalStore,
    addStreak,
    nextScreen,
    addScore,
  };
}
