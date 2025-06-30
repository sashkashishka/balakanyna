import { useTimer } from '@/signals/timer/index.ts';
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

export function TimerLimit({
  config,
  globalStore,
  nextScreen,
  addStreak,
  addScore,
}: IProps) {
  const { time, seconds } = useTimer(config.limit.value);

  return (
    <div class={styles.container}>
      <div class={styles.scoreboardContainer}>
        <div class={styles.timer}>Час: {time()}</div>
        <div class={styles.score}>Рахунок: {globalStore.score}</div>
      </div>

      <Playground
        checkGameEnd={() => {
          if (seconds() === 0) {
            nextScreen();
          }
        }}
        globalStore={globalStore}
        config={config}
        addScore={addScore}
        addStreak={addStreak}
      />
    </div>
  );
}
