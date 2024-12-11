import type { TTask } from 'shared/types/task.ts';
import { Slide, Slider } from '../../components/Slider/Slider.tsx';

import styles from './ImageSlider.module.css';
import { For } from 'solid-js';

interface IProps {
  config: Extract<TTask, { type: 'imageSlider' }>['config'];
}

export function ImageSlider(props: IProps) {
  const config = () => props.config;

  return (
    <div class={styles.container}>
      <h3 class={styles.title}>{config().title}</h3>

      <Slider>
        <For each={config().slides}>
          {({ image }) => (
            <Slide>
              <img
                src={image.path}
                alt={image.filename}
                width="100%"
                height="100%"
                style={{ 'object-fit': 'contain' }}
              />
            </Slide>
          )}
        </For>
      </Slider>
    </div>
  );
}

export function ImageSliderPreview(props: IProps) {
  return (
    <div
      style={{
        width: '400px',
        'max-width': '100%',
        'max-height': '100vh',
      }}
    >
      <ImageSlider {...props} />
    </div>
  );
}
