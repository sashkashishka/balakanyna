import { createSignal } from 'solid-js';

import { random } from '@/utils/random.ts';

import { colors, images } from './constants.ts';
import { getColor } from './utils.ts';

import styles from './SchulteTable.module.css';

interface IProps {
  n: number;
  nextN: number;
  setNextN(v: number): void;
  reverse: boolean;
}

export function Cell(props: IProps) {
  const [img, setImg] = createSignal<string>();

  return (
    <td
      class={styles.cell}
      onClick={(e) => {
        e.preventDefault();

        if (props.nextN === props.n) {
          props.setNextN(props.n + (props.reverse ? -1 : 1));
          setImg(images[random(0, images.length - 1)]);
        }
      }}
      style={{
        '--schulte-cell-bg': getColor(props.n, colors),
      }}
    >
      {img() && <img class={styles.image} src={img()} alt="animal" />}
      {props.n}
    </td>
  );
}
