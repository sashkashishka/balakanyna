import {
  getCreatedAtFilter,
  getLabelSelectorFilter,
  getSearchStringFilter,
  getTaskTypeSelectorFilter,
  getUserSelectorFilter,
} from '../Filters/constants';
import type { TFilters } from '../Filters/types';

export const name = getSearchStringFilter({
  label: 'Name',
  name: 'name',
  placeholder: 'Game task',
});

export const label = getLabelSelectorFilter({
  label: 'Labels',
  name: 'label',
  maxCount: 50,
  labelType: 'task',
});

export const userSearch = getUserSelectorFilter();

export const taskType = getTaskTypeSelectorFilter({
  label: 'Task type',
  name: 'type',
  maxCount: 50,
});

export const filtersConfig: Array<TFilters> = [
  name,
  label,
  userSearch,
  taskType,
  getCreatedAtFilter(),
];
