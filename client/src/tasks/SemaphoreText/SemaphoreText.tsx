import { createSignal, onCleanup } from 'solid-js';
import { random } from '../../utils/random.ts';

import styles from './SemaphoreText.module.css';

export function SemaphoreText({ config }) {
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
    random(...delayRange),
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
