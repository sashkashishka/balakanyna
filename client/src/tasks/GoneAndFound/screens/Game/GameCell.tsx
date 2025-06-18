import type { ICell } from '../../types.ts';

interface IProps {
  cell: ICell;
}

export function GameCell({ cell }: IProps) {
  if (cell) {
    return <img width="76px" height="76px" src={cell.item} />;
  }

  return null;
}
