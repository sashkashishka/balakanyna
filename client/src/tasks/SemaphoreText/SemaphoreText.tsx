import { createSignal, onCleanup } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';

import { random } from '../../utils/random.ts';

import styles from './SemaphoreText.module.css';

interface IProps {
  config: Extract<TTask, { type: 'semaphoreText' }>['config'];
}

export function SemaphoreText({ config }: IProps) {
  const { colors, delayRange, text } = config;

  const [index, setIndex] = createSignal(0);
  const [syllableIndex, setSyllableIndex] = createSignal(0);

  const timer = window.setInterval(
    () => {
      let newIndex = random(0, colors.length - 1);

      while (newIndex === index() && colors.length > 1) {
        newIndex = random(0, colors.length - 1);
      }

      setIndex(newIndex);
      setSyllableIndex(
        syllableIndex() === text.length - 1 ? 0 : syllableIndex() + 1,
      );
    },
    random(delayRange[0]!, delayRange[1]!),
  );

  onCleanup(() => {
    window.clearInterval(timer);
  });

  return (
    <div class={styles.container}>
      <div
        class={styles.circle}
        style={{
          '--bg': colors[index()],
        }}
      >
        {text[syllableIndex()]}
      </div>
    </div>
  );
}
