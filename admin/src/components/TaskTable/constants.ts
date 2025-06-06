import {
  getCreatedAtFilter,
  getLabelSelectorFilter,
  getSearchStringFilter,
  getSelectFilter,
  getTaskTypesSelectorFilter,
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
  name: 'labels',
  maxCount: 50,
  labelType: 'task',
});

export const userSearch = getUserSelectorFilter();

export const taskTypes = getTaskTypesSelectorFilter({
  label: 'Task types',
  name: 'types',
  maxCount: 50,
});

export const ids = getSelectFilter({
  label: 'Task ids',
  name: 'ids',
  options: [],
  disabled: true,
});

// TODO: add program search filter
// ask Nika how to search by program??

export const filtersConfig: Array<TFilters> = [
  ids,
  name,
  label,
  userSearch,
  taskTypes,
  getCreatedAtFilter(),
];
