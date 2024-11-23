import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';

interface IFilter {
  disabled?: boolean;
}

interface IDateRangeFilter extends IFilter {
  type: 'date-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

interface ISearchStringFilter extends IFilter {
  type: 'search-string';
  label: ReactNode;
  name: string;
  placeholder?: string;
}

interface ISearchSelectorFilter extends IFilter {
  type: 'user-selector';
  label: ReactNode;
  name: string;
  placeholder?: string;
  maxCount: number;
}

interface INumberRangeFilter extends IFilter {
  type: 'number-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

interface ISelectFilter extends IFilter {
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
