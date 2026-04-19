import { createSignal, For, Show } from 'solid-js';
import type { TTask } from 'shared/types/task.ts';
import styles from './SequenceMemory.module.css';

interface IProps {
  config: Extract<TTask, { type: 'sequenceMemory' }>['config'];
}

type TGameState = 'start' | 'showing' | 'input' | 'success' | 'failure';

export function SequenceMemory({ config }: IProps) {
  const [gameState, setGameState] = createSignal<TGameState>('start');
  const [sequence, setSequence] = createSignal<number[]>([]);
  const [userInput, setUserInput] = createSignal<number[]>([]);
  const [currentLevel, setCurrentLevel] = createSignal(1);
  const [showingIndex, setShowingIndex] = createSignal(-1);
  const [soundEnabled, setSoundEnabled] = createSignal(true);
  const [flashBg, setFlashBg] = createSignal<'white' | 'red' | null>(null);

  const totalCells = () => config.width * config.height;

  // Beep sounds for each cell (hardcoded frequencies)
  const frequencies = [
    261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
  ];

  const playSound = (cellIndex: number) => {
    if (!soundEnabled()) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequencies[cellIndex % frequencies.length]!;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      // Audio not supported
    }
  };

  const startGame = () => {
    setCurrentLevel(1);
    setSequence([Math.floor(Math.random() * totalCells())]);
    setUserInput([]);
    setGameState('showing');
    showSequence();
  };

  const nextLevel = () => {
    const nextLevel = currentLevel() + 1;
    setCurrentLevel(nextLevel);
    setSequence([...sequence(), Math.floor(Math.random() * totalCells())]);
    setUserInput([]);
    setGameState('showing');
    showSequence();
  };

  const showSequence = () => {
    const seq = sequence();
    let index = 0;

    const showNext = () => {
      if (index < seq.length) {
        setShowingIndex(seq[index]!);
        playSound(seq[index]!);

        setTimeout(() => {
          setShowingIndex(-1);
          index++;
          setTimeout(showNext, 200);
        }, 600);
      } else {
        setGameState('input');
      }
    };

    setTimeout(showNext, 500);
  };

  const handleCellClick = (cellIndex: number) => {
    if (gameState() !== 'input') return;

    const currentInput = [...userInput(), cellIndex];
    setUserInput(currentInput);
    playSound(cellIndex);

    const seq = sequence();
    const isCorrect =
      currentInput[currentInput.length - 1] === seq[currentInput.length - 1];

    if (!isCorrect) {
      // Wrong cell - game over
      setFlashBg('red');
      setTimeout(() => setFlashBg(null), 300);
      setGameState('failure');
      return;
    }

    if (currentInput.length === seq.length) {
      // Completed sequence correctly
      setFlashBg('white');
      setTimeout(() => setFlashBg(null), 300);

      setTimeout(() => {
        nextLevel();
      }, 800);
    }
  };

  const restart = () => {
    setGameState('start');
    setUserInput([]);
    setCurrentLevel(1);
    setShowingIndex(-1);
  };

  return (
    <div
      class={styles.container}
      classList={{
        [styles.flashWhite!]: flashBg() === 'white',
        [styles.flashRed!]: flashBg() === 'red',
      }}
    >
      <Show when={gameState() === 'start'}>
        <div class={styles.screen}>
          <h2>Тест на послідовну пам'ять</h2>
          <p>Запам'ятайте послідовність кнопок</p>
          <button class={styles.button} onClick={startGame}>
            Почати
          </button>
        </div>
      </Show>

      <Show when={gameState() === 'failure'}>
        <div class={styles.screen}>
          <h2>Гра закінчена</h2>
          <p>Досягнутий рівень: {currentLevel()}</p>
          <button class={styles.button} onClick={restart}>
            Перезапустити
          </button>
        </div>
      </Show>

      <Show when={gameState() === 'showing' || gameState() === 'input'}>
        <div class={styles.gameArea}>
          <div class={styles.header}>
            <div class={styles.level}>Рівень: {currentLevel()}</div>
            <button
              class={styles.soundToggle}
              onClick={() => setSoundEnabled(!soundEnabled())}
            >
              {soundEnabled() ? '🔊' : '🔇'}
            </button>
          </div>

          <div
            class={styles.grid}
            style={{
              'grid-template-columns': `repeat(${config.width}, 1fr)`,
              'grid-template-rows': `repeat(${config.height}, 1fr)`,
            }}
          >
            <For each={Array.from({ length: totalCells() }, (_, i) => i)}>
              {(cellIndex) => (
                <button
                  class={styles.cell}
                  classList={{
                    [styles.active!]: showingIndex() === cellIndex,
                    [styles.clickable!]: gameState() === 'input',
                  }}
                  onClick={() => handleCellClick(cellIndex)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
