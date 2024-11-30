import { atom, computed, map, onMount, onSet } from 'nanostores';
import { safeParse } from '@/utils/json';
import { $router } from './router';

export interface IFilters {
  page: number;
  order_by: string;
  dir: 'ascend' | 'descend';
  [key: string]: unknown;
}

interface IOptions {
  syncSearchParams?: boolean;
}

export function createListFilters<T extends IFilters>(
  defaultValue: T,
  options?: IOptions = {},
) {
  const { syncSearchParams = true } = options;

  const $pageSize = atom(20);
  function setPageSize(v: number) {
    $pageSize.set(v);
  }

  const $filters = map<T>(defaultValue);

  const $activeFilterCount = computed([$filters], (filters) =>
    Object.keys(filters).reduce((acc, curr) => {
      if (curr in defaultValue) {
        const val = filters[curr];
        let count = Number(val !== defaultValue[curr]);

        if (curr === 'page') {
          count = 0;
        }

        acc += count;
      } else {
        acc += 1;
      }

      return acc;
    }, 0),
  );

  const $filtersSearchParams = computed([$filters, $pageSize], (filters) => {
    const searchParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      const val = filters[key as keyof T];

      switch (true) {
        case Array.isArray(val): {
          val.forEach((item) => {
            searchParams.append(`${key}[]`, item);
          });
          break;
        }

        case key === 'page': {
          const limit = $pageSize.get();
          const skip = Math.max((val as number) - 1, 0) * limit;

          searchParams.set('limit', String(limit));
          searchParams.set('offset', String(skip));
          break;
        }

        case key === 'dir': {
          searchParams.set(key, val === 'descend' ? 'desc' : 'asc');
          break;
        }

        case key === 'order_by': {
          searchParams.set(key, val ? String(val) : defaultValue[key]);
          break;
        }

        default: {
          searchParams.set(key, String(val));
        }
      }
    });

    const search = searchParams.toString();

    if (!search) {
      return '';
    }

    return `?${search}`;
  });

  if (syncSearchParams) {
    onSet($filters, ({ newValue }) => {
      const url = new URL(location.pathname, location.origin);

      url.search = createFiltersSearchParams(newValue).toString();

      $router.open(url.toString());
    });

    onMount($filters, () => {
      const router = $router.get();

      if (!router) return;

      if (router.search.filters) {
        const filters = safeParse(window.atob(router.search.filters));

        if (filters) {
          $filters.set(filters);
        }
      }
    });
  }

  function setListFilter<TK extends keyof T>(key: TK, val: T[TK]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $filters.setKey(key, val);
  }

  function resetListFilter() {
    $filters.set(defaultValue);
  }

  return {
    $filters,
    $activeFilterCount,
    $filtersSearchParams,
    $pageSize,
    setPageSize,
    setListFilter,
    resetListFilter,
  };
}

export function createFiltersSearchParams(filters: IFilters): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.append('filters', window.btoa(JSON.stringify(filters)));

  return searchParams;
}
