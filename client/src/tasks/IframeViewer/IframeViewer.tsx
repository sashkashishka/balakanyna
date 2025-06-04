import type { TTask } from 'shared/types/task.ts';

import styles from './IframeViewer.module.css';

interface IProps {
  config: Extract<TTask, { type: 'iframeViewer' }>['config'];
}

export function IframeViewer({ config }: IProps) {
  const { link } = config;

  return (
    <div class={styles.container}>
      <iframe
        src={link}
        height="100%"
        width="100%"
        allowfullscreen
      />
    </div>
  );
}
