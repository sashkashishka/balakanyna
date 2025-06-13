// import styles from './'
export function FinishScreen({ globalStore, nextScreen, addStreak }) {
  return (
    <div>
      finish screen
      <br />
      <br />
      <button onClick={() => nextScreen()}>next screen</button>
      <br />
      <br />
      <button onClick={() => addStreak({ result: true })}>add streak</button>
      <br />
      <br />
      header with number to find and score field
      <br />
      <br />
      streak
      {JSON.stringify(globalStore.streak)}
      <br />
      <br />
      lives
      {globalStore.lives}
      <br />
      <br />
      score
      {globalStore.score}
      <br />
      <br />
      screen
      {globalStore.screen}
    </div>
  );
}
