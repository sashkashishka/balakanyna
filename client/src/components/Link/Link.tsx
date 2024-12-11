import type { JSX } from 'solid-js';
import { navigate } from '@/core/router/utils.ts';

import styles from './Link.module.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function Link(props: IProps) {
  return (
    <a
      {...props}
      onClick={e => {
        e.preventDefault();

        navigate(props.href!)
      }}
      classList={{
        [props.class!]: true,
        [styles.link!]: true,
      }}
    />
  );
}
