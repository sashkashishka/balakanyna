import { For } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';
import { Slide, Slider } from '../../components/Slider/Slider.tsx';

import { BrainboxCard } from './BrainboxCard.tsx';

import styles from './Brainbox.module.css';

interface IProps {
  class?: string;
  config: Extract<TTask, { type: 'brainbox' }>['config'];
}

export function Brainbox(props: IProps) {
  const config = () => props.config;

  return (
    <div classList={{ [styles.container!]: true, [props.class!]: true }}>
      <Slider>
        <For each={config().items}>
          {({ front, back }) => (
            <Slide>
              <BrainboxCard front={front} back={back} />
            </Slide>
          )}
        </For>
      </Slider>
    </div>
  );
}

export function BrainboxPreview(props: IProps) {
  return (
    <div
      style={{
        'max-width': '100%',
        height: '100%',
        width: '100%',
        'max-height': '100vh',
      }}
    >
      <Brainbox {...props} class={styles.previewContainer} />
    </div>
  );
}
