import { getSearchStringFilter, getSelectFilter } from '../Filters/constants';
import type { TFilters } from '../Filters/types';

export const filtersConfig: Array<TFilters> = [
  getSearchStringFilter({
    label: 'Name',
    name: 'name',
    placeholder: 'Label Veronika',
  }),
  getSelectFilter({
    label: 'Type',
    name: 'type',
    mode: 'multiple',
    options: [
      { label: 'Image', value: 'image' },
      { label: 'Task', value: 'task' },
    ],
  }),
];
