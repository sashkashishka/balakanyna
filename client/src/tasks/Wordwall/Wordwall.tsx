import type { TTask } from 'shared/types/task.ts';

import styles from './Wordwall.module.css';

interface IProps {
  config: Extract<TTask, { type: 'wordwall' }>['config'];
}

export function Wordwall({ config }: IProps) {
  const { link } = config;

  return (
    <div class={styles.container}>
      <iframe
        src={link}
        height="100%"
        width="100%"
      />
    </div>
  );
}
