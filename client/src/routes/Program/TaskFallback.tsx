import taskImage from '@/images/task.png';

import styles from './TaskFallback.module.css';

export function TaskFallback() {
  return (
    <div class={styles.container}>
      <img src={taskImage} width="200px" height="280px" alt="not-found" />

      <p>Тицьни на задачу щоб розпочати</p>
    </div>
  );
}
