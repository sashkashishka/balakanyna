import { createSignal } from 'solid-js';

import styles from './BrainboxCard.module.css';
import type { TTask } from 'shared/types/task.ts';

type TBrainboxItem = Extract<
  TTask,
  { type: 'brainbox' }
>['config']['items'][number];

// eslint-disable-next-line
interface IProps extends TBrainboxItem {}

export function BrainboxCard(props: IProps) {
  const [isFlipped, setFlipped] = createSignal(false);

  return (
    <div class={styles.container}>
      <div class={styles.flipCard} onClick={() => setFlipped(!isFlipped())}>
        <div
          class={styles.front}
          style={{
            transform: isFlipped() ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <img class={styles.image} src={props.front.path} alt="front" />
        </div>

        <div
          class={styles.back}
          style={{
            transform: isFlipped() ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          }}
        >
          <img class={styles.image} src={props.back.path} alt="back" />
        </div>
      </div>
    </div>
  );
}
