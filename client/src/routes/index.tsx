import { Switch, Match } from 'solid-js';
import { useRouter } from '@/core/router/router.tsx';

import { DefaultLayout } from '@/components/Layout/Default/Default.tsx';

import { ALIASES } from './constants.ts';
import { HomePage } from './Home/index.ts';
import { NotFoundPage } from './NotFound/index.ts';
import { ProgramPage } from './Program/index.ts';

export function Routes() {
  const router = useRouter();

  if (!router) return null;

  return (
    <DefaultLayout>
      <Switch fallback={<NotFoundPage />}>
        <Match when={router.alias === ALIASES.HOME}>
          <HomePage />
        </Match>

        <Match
          when={
            router.alias === ALIASES.PROGRAM || router.alias === ALIASES.TASK
          }
        >
          <ProgramPage />
        </Match>
      </Switch>
    </DefaultLayout>
  );
}
