import type { TTask } from 'shared/types/task.ts';
import { Slide, Slider } from '../../components/Slider/Slider.tsx';

import styles from './ImageSlider.module.css';

interface IProps {
  config: Extract<TTask, { type: 'imageSlider' }>['config'];
}

export function ImageSlider({ config }: IProps) {
  return (
    <div>
      <h3 class={styles.title}>{config.title}</h3>

      <Slider>
        {config.slides.map(({ image }) => (
          <Slide>
            <img
              src={image.path}
              alt={image.filename}
              width="100%"
              height="100%"
              style={{ 'object-fit': 'contain' }}
            />
          </Slide>
        ))}
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
