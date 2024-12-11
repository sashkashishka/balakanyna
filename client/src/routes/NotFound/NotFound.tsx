import notFoundImage from '@/images/not-found.png';
import { Link } from '@/components/Link/index.ts';
import { ROUTES } from '../constants.ts';

import styles from './NotFound.module.css';

export function NotFoundPage() {
  return (
    <div class={styles.container}>
      <img src={notFoundImage} width="200px" height="100px" alt="not-found" />

      <h2>Упс, сторінку не знайдено...</h2>

      <Link href={ROUTES.HOME}>На головну</Link>
    </div>
  );
}
