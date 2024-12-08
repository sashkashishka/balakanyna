import {
  createContext,
  onCleanup,
  useContext,
  type JSXElement,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import type { IRoute, IRoutesConfig } from './types.ts';
import { createParser } from './utils.ts';

const RouterContext = createContext<IRoute>();

export function useRouter() {
  return useContext(RouterContext);
}

export function useParams() {
  return useContext(RouterContext)?.params;
}

export function useSearchParams() {
  return useContext(RouterContext)?.searchParams;
}

interface IProps {
  routes: IRoutesConfig;
  children?: JSXElement[] | JSXElement;
}

export function Router(props: IProps) {
  const parser = createParser(props.routes);

  const [state, setState] = createStore<IRoute>(parser(location.pathname));

  const onChange = () => {
    setState(parser(location.pathname));
  };

  window.addEventListener('popstate', onChange);
  window.addEventListener('pushState', onChange);
  window.addEventListener('replaceState', onChange);

  onCleanup(() => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('pushState', onChange);
    window.removeEventListener('replaceState', onChange);
  });

  return (
    <RouterContext.Provider value={state}>
      {props.children}
    </RouterContext.Provider>
  );
}
