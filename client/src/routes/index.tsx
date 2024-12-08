import { Switch, Match } from 'solid-js';
import { useRouter } from '@/core/router/router.tsx';
import { ALIASES } from './constants.ts';

import { HomePage } from './Home/index.tsx';
import { NotFoundPage } from './NotFound/index.tsx';

export function Routes() {
  const router = useRouter();

  if (!router) return null;

  return (
    <Switch fallback={<NotFoundPage />}>
      <Match when={router.alias === ALIASES.HOME}>
        <HomePage />
      </Match>
    </Switch>
  );
}
