// import styles from './'
export function StartScreen({ addStreak, nextScreen, globalStore }) {
  return (
    <div>
      start screen
      <br />
      <button onClick={() => nextScreen()}>next screen</button>
    </div>
  );
}
