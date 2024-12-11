import type { IRoutesConfig } from './types.ts';

export function createParser(routes: IRoutesConfig) {
  const aliases = Object.keys(routes);

  const matchers = aliases.map((alias) => {
    const pattern = routes[alias]!.replace('/$', '') || '/';

    const regexp = pattern
      .replace(/[\s!#$()+,.:<=?[\\\]^{|}]/g, '\\$&')
      .replace(/\/\\:(\w+)\\\?/g, '(?:/(?<$1>(?<=/)[^/]+))?')
      .replace(/\/\\:(\w+)/g, '/(?<$1>[^/]+)');

    return {
      regexp: RegExp('^' + regexp + '$', 'i'),
      pattern,
    };
  });

  return function parse(href: string) {
    const url = new URL(href, 'https://example.com');

    for (let i = 0; i < aliases.length; i++) {
      const { regexp, pattern } = matchers[i]!;

      const match = url.pathname.match(regexp);

      if (match) {
        return {
          alias: aliases[i]!,
          pattern,
          params: Object.keys({ ...match.groups }).reduce<
            Record<string, string>
          >((params, key) => {
            params[key] = match.groups![key]
              ? decodeURIComponent(match.groups![key])
              : '';
            return params;
          }, {}),
          pathname: url.pathname,
          searchParams: Object.fromEntries(url.searchParams),
        };
      }
    }

    return {
      alias: '',
      pattern: '',
      params: {},
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams),
    };
  };
}

export function navigate<TS = unknown>(
  to: string,
  { replace = false, state }: { replace?: boolean; state?: TS } = {},
) {
  const type = replace ? 'replaceState' : 'pushState';
  history[type](state || null, '', to);

  const event = new Event(type);
  dispatchEvent(event);
}
