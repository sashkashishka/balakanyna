import { Switch, Match } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';

import { useGlobalStore } from './stores/global.ts';
import { StartScreen } from './screens/Start/StartScreen.tsx';
import { GameScreen } from './screens/Game/GameScreen.tsx';
import { FinishScreen } from './screens/Finish/FinishScreen.tsx';

import styles from './GoneAndFound.module.css';

interface IProps {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
}

export function GoneAndFound({ config }: IProps) {
  const { globalStore, addStreak, nextScreen, addScore } = useGlobalStore();

  return (
    <div class={styles.container}>
      <Switch>
        <Match when={globalStore.screen === 'start'}>
          <StartScreen config={config} nextScreen={nextScreen} />
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
          <FinishScreen config={config} globalStore={globalStore} />
        </Match>
      </Switch>
    </div>
  );
}
