import { createSignal } from 'solid-js';

import type { TTask } from 'shared/types/task.ts';
import type { IGlobalState, IStreak } from '../../types.ts';

import { Playground } from './Playground.tsx';

import styles from './GameScreen.module.css';

interface IProps {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
  globalStore: IGlobalState;
  nextScreen(): void;
  addScore(v: number): void;
  addStreak(streak: IStreak): void;
}

export function RoundLimit({
  config,
  globalStore,
  nextScreen,
  addStreak,
  addScore,
}: IProps) {
  const [round, setRound] = createSignal(0);

  return (
    <div class={styles.container}>
      <div class={styles.scoreboardContainer}>
        <div class={styles.timer}>
          Раунд: {round() + 1}/{config.limit.value}
        </div>
        <div class={styles.score}>Рахунок: {globalStore.score}</div>
      </div>

      <Playground
        checkGameEnd={() => {
          if (round() === config.limit.value - 1) {
            return nextScreen();
          }

          setRound((v) => v + 1);
        }}
        globalStore={globalStore}
        config={config}
        addScore={addScore}
        addStreak={addStreak}
      />
    </div>
  );
}
