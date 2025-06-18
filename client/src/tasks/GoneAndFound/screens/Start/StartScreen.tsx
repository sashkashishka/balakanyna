import { Switch, Match, createEffect, createSignal } from 'solid-js';

import { Button } from '@/components/Button/Button.tsx';
import { useTimer } from '@/signals/timer/index.ts';
import type { TTask } from 'shared/types/task.ts';

import { ITEM_PRESETS_BG } from '../../constants.ts';

import styles from './StartScreen.module.css';

interface IProps {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
  nextScreen(): void;
}

function Countdown({ nextScreen }: Pick<IProps, 'nextScreen'>) {
  const { seconds } = useTimer(3);

  createEffect(() => {
    if (seconds() === 0) {
      nextScreen();
    }
  });

  return <Button class={styles.startButton}>{seconds()}</Button>;
}

export function StartScreen({ nextScreen, config }: IProps) {
  const [start, setStart] = createSignal(false);

  const { fieldBg } = ITEM_PRESETS_BG[config.preset];

  return (
    <div class={styles.container} style={{ '--bg': `url(${fieldBg})` }}>
      <h2 class={styles.title}>Знайдіть предмети, що зникли</h2>
      <Switch>
        <Match when={start()}>
          <Countdown nextScreen={nextScreen} />
        </Match>

        <Match when={!start()}>
          <Button class={styles.startButton} onClick={() => setStart(true)}>
            Старт
          </Button>
        </Match>
      </Switch>
    </div>
  );
}
