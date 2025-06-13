import { createSignal, onCleanup } from 'solid-js';

const SECOND = 1000;

export function useTimer(duration: number) {
  const [seconds, setSeconds] = createSignal(duration);

  let timerId = 0;

  const counter = () => {
    setSeconds(seconds() - 1);

    if (seconds() > 0) {
      timerId = window.setTimeout(counter, SECOND);
    }
  };

  timerId = window.setTimeout(counter, SECOND);

  onCleanup(() => {
    window.clearInterval(timerId);
  });

  const time = () => {
    const min = Math.floor(seconds() / 60);
    const sec = seconds() % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return { seconds, time };
}
