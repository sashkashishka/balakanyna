import type { JSX } from 'solid-js';

import styles from './Button.module.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button(props: IProps) {
  return (
    <button
      {...props}
      classList={{
        [props.class!]: true,
        [styles.button!]: true,
      }}
    />
  );
}
