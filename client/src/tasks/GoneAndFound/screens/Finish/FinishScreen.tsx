import type { TTask } from 'shared/types/task.ts';
import type { IGlobalState } from '../../types.ts';

import { ITEM_PRESETS_BG } from '../../constants.ts';

import styles from './FinishScreen.module.css';

interface IProps {
  globalStore: IGlobalState;
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
}

export function FinishScreen({ globalStore, config }: IProps) {
  const { fieldBg } = ITEM_PRESETS_BG[config.preset];

  return (
    <div class={styles.container} style={{ '--bg': `url(${fieldBg})` }}>
      <h2 class={styles.score}>Рахунок: {globalStore.score}</h2>
    </div>
  );
}
