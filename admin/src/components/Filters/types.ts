import type { SelectProps } from 'antd';
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

interface ISearchSelectorFilter {
  type: 'user-selector';
  label: ReactNode;
  name: string;
  placeholder?: string;
  maxCount: number;
}

interface INumberRangeFilter {
  type: 'number-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

interface ISelectFilter {
  type: 'select';
  name: string;
  label: ReactNode;
  options: SelectProps['options'];
}

export type TFilters =
  | IDateRangeFilter
  | ISearchStringFilter
  | ISearchSelectorFilter
  | ISelectFilter
  | INumberRangeFilter;
