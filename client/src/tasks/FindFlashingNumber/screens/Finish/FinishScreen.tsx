import type { IGlobalState } from '../../types.ts';
import { COLORS } from '../Game/constants.ts';

import styles from './FinishScreen.module.css';

interface IProps {
  globalStore: IGlobalState;
}

export function FinishScreen({ globalStore }: IProps) {
  return (
    <div class={styles.container} style={{ '--bg': COLORS[0] }}>
      <h2 class={styles.score}>Рахунок: {globalStore.score}</h2>
    </div>
  );
}
