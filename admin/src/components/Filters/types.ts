import type { ReactNode } from 'react';

interface IDateRangeFilter {
  type: 'date-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

interface ISearchStringFilter {
  type: 'search-string';
  label: ReactNode;
  name: string;
  placeholder?: string;
}

interface INumberRangeFilter {
  type: 'number-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

export type TFilters =
  | IDateRangeFilter
  | ISearchStringFilter
  | INumberRangeFilter;
