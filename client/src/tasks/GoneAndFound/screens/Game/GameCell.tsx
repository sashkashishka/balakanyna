import type { ICell } from '../../types.ts';

import styles from './GameCell.module.css';

interface IProps {
  cell: ICell;
}

export function GameCell({ cell }: IProps) {
  if (cell) {
    return <img class={styles.cell} src={cell.item} />;
  }

  return null;
}
