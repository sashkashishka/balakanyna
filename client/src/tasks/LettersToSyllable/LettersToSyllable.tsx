import type { TTask } from 'shared/types/task.ts';
import { createSignal, For } from 'solid-js';
import { Motion } from 'solid-motionone';
import { Slide, Slider } from '../../components/Slider/Slider.tsx';

import styles from './LettersToSyllable.module.css';

type TLettersToSyllable = Extract<TTask, { type: 'lettersToSyllable' }>;

const vowels = ['а', 'е', 'и', 'о', 'у', 'я', 'є', 'і', 'ьо', 'ю'];

interface ILetterProps {
  value: TLettersToSyllable['config']['list'][number]['first'];
  vowelColor: TLettersToSyllable['config']['list'][number]['vowelColor'];
  destination: number;
  dir: 'left' | 'right';
}

function Letter(props: ILetterProps) {
  return (
    <div class={styles.letterWrapper}>
      <Motion.div
        class={styles.letter}
        animate={{
          [props.dir]: `${props.destination}%`,
          translate: `${props.dir === 'left' ? '-' : ''}${props.destination}%`,
        }}
        transition={{ duration: 1, easing: [0.2, -0.09, 0.13, 1.03] }}
      >
        {props.value.split('').map((l) => {
          const isVowel = vowels.includes(l.toLowerCase());

          return isVowel ? (
            <span style={{ color: props.vowelColor }}>{l}</span>
          ) : (
            l
          );
        })}
      </Motion.div>
    </div>
  );
}

interface ISyllableProps {
  syllable: TLettersToSyllable['config']['list'][number];
}

function Syllable({ syllable }: ISyllableProps) {
  const [destination, setDestination] = createSignal(0);

  return (
    <div class={styles.syllable} onClick={() => setDestination(100)}>
      <Letter
        dir="left"
        value={syllable.first}
        destination={destination()}
        vowelColor={syllable.vowelColor}
      />
      <Letter
        dir="right"
        value={syllable.last}
        destination={destination()}
        vowelColor={syllable.vowelColor}
      />
    </div>
  );
}

interface IProps {
  config: TLettersToSyllable['config'];
}

export function LettersToSyllable(props: IProps) {
  const config = () => props.config;

  return (
    <div class={styles.container}>
      <Slider>
        <For each={config().list}>
          {(syllable) => (
            <Slide>
              <Syllable syllable={syllable} />
            </Slide>
          )}
        </For>
      </Slider>
    </div>
  );
}
