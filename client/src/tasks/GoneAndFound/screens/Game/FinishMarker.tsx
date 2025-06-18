import type { IGameState } from '../../types.ts';

import checkMark from '../../images/check-mark.png';
import crossMark from '../../images/cross-mark.png';

import styles from './FinishMarker.module.css';

interface IProps {
  type: IGameState['proceedType'];
  nextGame(): void;
}

export function FinishMarker({ type, nextGame }: IProps) {
  setTimeout(() => nextGame(), 1000);

  return (
    <div class={styles.finishMarker}>
      <img
        width="150px"
        height="150px"
        src={type === 'success' ? checkMark : crossMark}
      />
    </div>
  );
}
