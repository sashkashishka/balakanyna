import { createSignal, createEffect, For } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';

import { Button } from '@/components/Button/Button.tsx';

import { Cell } from './Cell.tsx';
import { generateSchulteTable } from './utils.ts';

import styles from './SchulteTable.module.css';

interface IProps {
  config: Extract<TTask, { type: 'schulteTable' }>['config'];
}

export function SchulteTable({ config }: IProps) {
  const { x, y, reverse } = config;

  const size = x * y;

  const [table, setTable] = createSignal(generateSchulteTable(x, y));
  const [nextN, setNextN] = createSignal(reverse ? size : 1);

  createEffect(() => {
    setTable(generateSchulteTable(x, y));
    setNextN(reverse ? size : 1);
  });

  const handler = (n: number) => setNextN(n);

  return (
    <div class={styles.container}>
      <table>
        <tbody>
          <For each={table()}>
            {(row) => (
              <tr>
                <For each={row}>
                  {(n) => (
                    <Cell
                      n={n}
                      nextN={nextN()}
                      setNextN={handler}
                      reverse={reverse}
                    />
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      <Button
        class={styles.button}
        type="button"
        onClick={() => {
          setTable(generateSchulteTable(x, y));
          setNextN(reverse ? size : 1);
        }}
      >
        Перезапустити
      </Button>
    </div>
  );
}
