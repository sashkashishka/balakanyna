import { For } from 'solid-js';
import { useGameStore } from '../../stores/game/game.ts';
import { GameCell } from './GameCell.tsx';

import styles from './GameScreen.module.css';

export function GameScreen({
  config,
  globalStore,
  nextScreen,
  addStreak,
  addScore,
}) {
  const { gameStore, pickNumber } = useGameStore({
    config,
    globalStore,
    addScore,
    addStreak,
  });

  return (
    <div
      class={styles.container}
      style={{
        '--animation-duration': `${gameStore.animationDuration}ms`,
        '--bg': gameStore.color,
      }}
    >
      score {globalStore.score}
      scoreboard and timer header with number to search
      <br />
      <br />
      search {gameStore.searchNumber}
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
  );
}
