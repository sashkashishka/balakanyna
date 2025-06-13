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

export function FindFlashingNumber({ config }: IProps) {
  const { globalStore, addStreak, nextScreen, addScore } = useGlobalStore();

  return (
    <div class={styles.container}>
      <Switch>
        <Match when={globalStore.screen === 'start'}>
          <StartScreen nextScreen={nextScreen} />
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
          <FinishScreen globalStore={globalStore} />
        </Match>
      </Switch>
    </div>
  );
}
