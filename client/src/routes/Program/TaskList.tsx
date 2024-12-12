import { createSignal, For } from 'solid-js';
import type { IProgramFull } from 'shared/types/program.ts';

import { Button } from '@/components/Button/index.ts';
import { Link } from '@/components/Link/index.ts';
import { CrossIcon } from '@/components/Icons/Cross.tsx';
import { MenuIcon } from '@/components/Icons/Menu.tsx';
import { useRouter } from '@/core/router/router.tsx';

import { getTaskHref } from './utils.ts';

import styles from './TaskList.module.css';

interface IProps {
  tasks?: IProgramFull['tasks'];
}

export function TaskList({ tasks }: IProps) {
  const router = useRouter();
  const [open, setOpen] = createSignal(false);

  const pid = () => router?.params?.pid;
  const tid = () => router?.params?.tid;

  return (
    <>
      <Button
        type="button"
        class={styles.button}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuIcon width="36px" height="36px" />
      </Button>

      <div
        classList={{
          [styles.overlay!]: true,
          [styles.overlayOpen!]: open(),
        }}
        onClick={() => setOpen(false)}
      />

      <div
        classList={{
          [styles.container!]: true,
          [styles.containerOpen!]: open(),
        }}
      >
        <div class={styles.containerHeader}>
          <CrossIcon
            width="32px"
            height="32px"
            onClick={() => setOpen(false)}
          />
        </div>

        <div class={styles.containerBody}>
          <h2>Потренуємось!</h2>

          <div class={styles.list}>
            <For each={tasks}>
              {(task, i) => (
                <div
                  classList={{
                    [styles.listItem!]: true,
                    [styles.listItemActive!]: String(task.id) === tid(),
                  }}
                  onClick={() => setOpen(false)}
                >
                  <Link
                    href={getTaskHref(pid(), String(task.id))}
                    class={styles.listItemLink}
                  >
                    Завдання {i() + 1}
                  </Link>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </>
  );
}
