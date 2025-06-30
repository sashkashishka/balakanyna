import { Switch, Match } from 'solid-js';

import type { TTask } from 'shared/types/task.ts';
import type { IGlobalState, IStreak } from '../../types.ts';

import { TimerLimit } from './TimerLimit.tsx';
import { RoundLimit } from './RoundLimit.tsx';

interface IProps {
  config: Extract<TTask, { type: 'goneAndFound' }>['config'];
  globalStore: IGlobalState;
  nextScreen(): void;
  addScore(v: number): void;
  addStreak(streak: IStreak): void;
}

export function GameScreen({
  config,
  globalStore,
  nextScreen,
  addStreak,
  addScore,
}: IProps) {
  return (
    <Switch>
      <Match when={config.limit.type === 'timer'}>
        <TimerLimit
          nextScreen={nextScreen}
          globalStore={globalStore}
          config={config}
          addScore={addScore}
          addStreak={addStreak}
        />
      </Match>

      <Match when={config.limit.type === 'rounds'}>
        <RoundLimit
          nextScreen={nextScreen}
          globalStore={globalStore}
          config={config}
          addScore={addScore}
          addStreak={addStreak}
        />
      </Match>
    </Switch>
  );
}
