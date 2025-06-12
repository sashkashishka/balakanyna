import { Switch, Match, ErrorBoundary } from 'solid-js';
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
          <ErrorBoundary
            fallback={(err) => {
              Sentry.forceLoad();
              // eslint-disable-next-line
              Sentry.withScope((scope: any) => {
                scope.setTag('program', router?.params?.tid);
                Sentry.captureException(err);
              });
              return null;
            }}
          >
            <ProgramPage />
          </ErrorBoundary>
        </Match>
      </Switch>
    </DefaultLayout>
  );
}
