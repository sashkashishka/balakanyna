import { Switch, Match, createEffect, createSignal } from 'solid-js';

import styles from './StartScreen.module.css';
import { useTimer } from '@/signals/timer/index.ts';
import { COLORS } from '../Game/constants.ts';

interface IProps {
  nextScreen(): void;
}

function Countdown({ nextScreen }: IProps) {
  const { seconds } = useTimer(3);

  createEffect(() => {
    if (seconds() === 0) {
      nextScreen();
    }
  });

  return <div class={styles.startButton}>{seconds()}</div>;
}

export function StartScreen({ nextScreen }: IProps) {
  const [start, setStart] = createSignal(false);

  return (
    <div
      class={styles.container}
      style={{ '--bg': COLORS[0], '--btn-bg': COLORS[1] }}
    >
      <h2 class={styles.title}>Знайдіть числа</h2>
      <Switch>
        <Match when={start()}>
          <Countdown nextScreen={nextScreen} />
        </Match>

        <Match when={!start()}>
          <div class={styles.startButton} onClick={() => setStart(true)}>
            Старт
          </div>
        </Match>
      </Switch>
    </div>
  );
}
