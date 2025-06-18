import homeImage from '@/images/home.png';

import styles from './Home.module.css';

export function HomePage() {
  return (
    <div class={styles.container}>
      <img src={homeImage} width="300px" height="300px" alt="home page" />

      <h2>Вітаємо у Балаканині!</h2>

      {/* <p>Звʼяжіться з нами ось тутоньки: TODO</p> */}
    </div>
  );
}
