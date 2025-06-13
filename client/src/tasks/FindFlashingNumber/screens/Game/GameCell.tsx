import cn from 'classnames';

import type { ICell } from '../../types.ts';

import styles from './GameCell.module.css';

interface IProps extends ICell {
  pickNumber(v: number): void;
}

export function GameCell({ pickNumber, number, animation, color }: IProps) {
  return (
    <td class={styles.td} onClick={() => pickNumber(number)}>
      <div
        class={cn(styles.gameCell, {
          [styles.gameCellOpacity!]: animation === 'opacity',
          [styles.gameCellZoom!]: animation === 'zoom',
        })}
        style={{ '--cell-color': color }}
      >
        <span
          class={cn({
            [styles.gameCellSwing!]: animation === 'swing',
          })}
        >
          {number}
        </span>
      </div>
    </td>
  );
}
