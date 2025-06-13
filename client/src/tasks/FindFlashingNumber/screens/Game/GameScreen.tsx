import { createEffect, For } from 'solid-js';
import { useGameStore } from '../../stores/game/game.ts';
import { GameCell } from './GameCell.tsx';

import { useTimer } from '@/signals/timer/index.ts';
import type { TTask } from 'shared/types/task.ts';
import type { IGlobalState, IStreak } from '../../types.ts';

import styles from './GameScreen.module.css';

interface IProps {
  config: Extract<TTask, { type: 'findFlashingNumber' }>['config'];
  globalStore: IGlobalState;
  nextScreen(): void;
  addScore(v: number): void;
  addStreak(streak: IStreak): void;
}

export function GameScreen({
  config,
  globalStore,
  nextScreen,
  addStreak,
  addScore,
}: IProps) {
  const { gameStore, pickNumber } = useGameStore({
    config,
    globalStore,
    addScore,
    addStreak,
  });

  const { time, seconds } = useTimer(config.duration);

  createEffect(() => {
    if (seconds() === 0) {
      // TODO: add animation to smoothly transition to the next screen
      nextScreen();
    }
  });

  return (
    <div
      class={styles.container}
      style={{
        '--animation-duration': `${gameStore.animationDuration}ms`,
        '--bg': gameStore.color,
      }}
    >
      <div class={styles.scoreboardContainer}>
        <div class={styles.timer}>Час: {time()}</div>
        <div class={styles.score}>Рахунок: {globalStore.score}</div>
      </div>

      <div class={styles.gameArea}>
        <div class={styles.searchNumberContainer}>
          <p class={styles.searchNumberTitle}>Знайдіть вказане число:</p>
          <span class={styles.searchNumber}>{gameStore.searchNumber}</span>
        </div>
        <br />
        <br />
        <table class={styles.table}>
          <tbody>
            <For each={gameStore.field}>
              {(row) => (
                <tr>
                  <For each={row}>
                    {(n) => (
                      <GameCell
                        pickNumber={pickNumber}
                        number={n.number}
                        color={n.color}
                        animation={n.animation}
                      />
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
