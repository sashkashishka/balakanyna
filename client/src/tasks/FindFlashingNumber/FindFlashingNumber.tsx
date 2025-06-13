import { Switch, Match } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';

import { useGlobalStore } from './stores/global.ts';
import { StartScreen } from './screens/Start/StartScreen.tsx';
import { GameScreen } from './screens/Game/GameScreen.tsx';
import { FinishScreen } from './screens/Finish/FinishScreen.tsx';

import styles from './FindFlashingNumber.module.css';

interface IProps {
  config: Extract<TTask, { type: 'findFlashingNumber' }>['config'];
}

const defaultConfig: IProps['config'] = {
  duration: 60,
  streak: { length: 15 },
  animation: {
    min: 700,
    max: 1000,
  },
  positionalDigit: {
    min: 2,
    max: 4,
  },
  y: {
    min: 3,
    max: 6,
  },
  x: {
    min: 4,
    max: 5,
  },
};

export function FindFlashingNumber({ config = defaultConfig }: IProps) {
  const { globalStore, addStreak, nextScreen, addScore } = useGlobalStore();
  // const { link } = config;

  return (
    <Switch>
      <Match when={globalStore.screen === 'start'}>
        <StartScreen
          globalStore={globalStore}
          addStreak={addStreak}
          nextScreen={nextScreen}
        />
      </Match>

      <Match when={globalStore.screen === 'game'}>
        <GameScreen
          config={config}
          globalStore={globalStore}
          addStreak={addStreak}
          nextScreen={nextScreen}
          addScore={addScore}
        />
      </Match>

      <Match when={globalStore.screen === 'finish'}>
        <FinishScreen
          globalStore={globalStore}
          addStreak={addStreak}
          nextScreen={nextScreen}
        />
      </Match>
    </Switch>
  );
}

// start screen
// game screen
// finish screen

// algorithm
// 1. start with x.min and y.min
// 2. check consecutive streak and depending on progress - increase to max x and y and also number
