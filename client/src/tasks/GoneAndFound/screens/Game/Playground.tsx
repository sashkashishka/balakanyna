import { For, Show } from 'solid-js';
import cn from 'classnames';

import { Button } from '@/components/Button/Button.tsx';
import type { TTask } from 'shared/types/task.ts';

import { useGameStore } from '../../stores/game/game.ts';
import { GameCell } from './GameCell.tsx';
import { FinishMarker } from './FinishMarker.tsx';

import type { IGlobalState, IStreak } from '../../types.ts';

import { ITEM_PRESETS_BG } from '../../constants.ts';

import styles from './Playground.module.css';

interface IProps {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
  globalStore: IGlobalState;
  checkGameEnd(): void;
  addScore(v: number): void;
  addStreak(streak: IStreak): void;
}

export function Playground({
  config,
  globalStore,
  checkGameEnd,
  addStreak,
  addScore,
}: IProps) {
  const { gameStore, nextPhase, pickItem, nextGame } = useGameStore({
    config,
    globalStore,
    addScore,
    addStreak,
  });

  const { fieldBg, pickBg } = ITEM_PRESETS_BG[config.preset];

  return (
    <div class={styles.playground}>
      <div class={styles.fieldArea} style={{ '--bg': `url(${fieldBg})` }}>
        <div
          class={styles.grid}
          style={{
            '--x': gameStore.dimensions.x,
            '--y': gameStore.dimensions.y,
          }}
        >
          <For each={gameStore.field}>
            {(cell) => {
              const show = () => {
                const showInFindPhase = !cell?.disappear;

                if (gameStore.phase === 'find') {
                  return showInFindPhase;
                }

                return true;
              };

              return (
                <div class={styles.cell}>
                  <Show when={show()}>
                    <GameCell cell={cell} />
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      <div class={styles.pickArea} style={{ '--bg': `url(${pickBg})` }}>
        <Show when={gameStore.phase === 'remember'}>
          <Button class={styles.rememberBtn} onClick={() => nextPhase()}>
            Запамʼятав
          </Button>
        </Show>

        <div
          class={cn(styles.pickField, {
            [styles.pickFieldHidden!]: gameStore.phase !== 'find',
          })}
        >
          <For each={gameStore.pickingBoard}>
            {(cell) => (
              <div
                class={cn(styles.cell, styles.clickable)}
                style={{ background: cell.disappear ? 'red' : undefined }}
                onClick={() => pickItem(cell.item)}
              >
                <GameCell cell={cell} />
              </div>
            )}
          </For>
        </div>
      </div>

      <Show when={gameStore.proceedType !== null}>
        <FinishMarker
          type={gameStore.proceedType}
          nextGame={() => {
            nextGame();
            checkGameEnd();
          }}
        />
      </Show>
    </div>
  );
}
