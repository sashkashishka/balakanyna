import type { JSXElement } from 'solid-js';
import logoBlue from '@/images/logo-blue.png';

import styles from './Default.module.css';

interface IProps {
  children: JSXElement;
}

export function DefaultLayout({ children }: IProps) {
  return (
    <div class={styles.container}>
      <header class={styles.header}>
        <img
          class={styles.logo}
          src={logoBlue}
          width="48px"
          height="48px"
          alt="logo"
        />
      </header>

      <main>{children}</main>
    </div>
  );
}
