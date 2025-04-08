import type { ILabel } from 'shared/types/label';
import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';

interface IFilter {
  disabled?: boolean;
}

export interface IDateRangeFilter extends IFilter {
  type: 'date-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

export interface ISearchStringFilter extends IFilter {
  type: 'search-string';
  label: ReactNode;
  name: string;
  placeholder?: string;
}

export interface IUserSelectorFilter extends IFilter {
  type: 'user-selector';
  label: ReactNode;
  name: string;
  placeholder?: string;
  maxCount: number;
}

export interface INumberRangeFilter extends IFilter {
  type: 'number-range';
  label: ReactNode;
  minName: string;
  maxName: string;
}

export interface ISelectFilter extends IFilter {
  type: 'select';
  name: string;
  label: ReactNode;
  options: SelectProps['options'];
}

export interface ILabelSelectorFilter extends IFilter {
  type: 'label-selector';
  label: ReactNode;
  labelType: ILabel['type'];
  name: string;
  placeholder?: string;
  maxCount: number;
}

export interface ITaskTypesSelectorFilter extends IFilter {
  type: 'task-types-selector';
  label: ReactNode;
  name: string;
  placeholder?: string;
  maxCount: number;
}

export type TFilters =
  | IDateRangeFilter
  | ISearchStringFilter
  | IUserSelectorFilter
  | ISelectFilter
  | ILabelSelectorFilter
  | ITaskTypesSelectorFilter
  | INumberRangeFilter;
