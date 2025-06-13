import { createSignal, onCleanup, Switch, Match, Show } from 'solid-js';
import cn from 'classnames';
import type { TTask } from 'shared/types/task.ts';

import { random } from '../../utils/random.ts';

import styles from './SemaphoreText.module.css';
import { useTimer } from '@/signals/timer/index.ts';

interface ITimerProps {
  duration: number;
}

function Timer({ duration }: ITimerProps) {
  const { seconds, time } = useTimer(duration);

  return (
    <div
      class={cn(styles.timerContainer, seconds() === 0 && styles.runOutOfTime)}
    >
      {time()}
    </div>
  );
}

interface IProps {
  config: Extract<TTask, { type: 'semaphoreText' }>['config'];
}

function Semaphore({ config }: IProps) {
  const { colors, delayRange, text } = config;

  const [index, setIndex] = createSignal(0);
  const [syllableIndex, setSyllableIndex] = createSignal(0);

  const timerId = window.setInterval(
    () => {
      let newIndex = random(0, colors.length - 1);
      let newSyllableIndex = random(0, text.length - 1);

      while (newIndex === index() && colors.length > 1) {
        newIndex = random(0, colors.length - 1);
      }

      while (newSyllableIndex === syllableIndex() && text.length > 1) {
        newSyllableIndex = random(0, text.length - 1);
      }

      setIndex(newIndex);
      setSyllableIndex(newSyllableIndex);
    },
    random(delayRange[0]!, delayRange[1]!),
  );

  onCleanup(() => {
    window.clearInterval(timerId);
  });

  return (
    <div
      class={styles.circle}
      style={{
        '--bg': colors[index()],
      }}
    >
      {text[syllableIndex()]}
    </div>
  );
}

export function SemaphoreText({ config }: IProps) {
  const { colors, timer } = config;

  const isTimer = !!timer?.duration;
  const [start, setStart] = createSignal(false);

  return (
    <div class={styles.container}>
      <Show when={isTimer}>
        <Switch>
          <Match when={start()}>
            <Timer duration={timer!.duration} />
            <Semaphore config={config} />
          </Match>
          <Match when={!start()}>
            <div
              class={cn(styles.circle, styles.startBtn)}
              onClick={() => setStart(true)}
              style={{
                '--bg': colors[0],
              }}
            >
              Старт
            </div>
          </Match>
        </Switch>
      </Show>

      <Show when={!isTimer}>
        <Semaphore config={config} />
      </Show>
    </div>
  );
}
