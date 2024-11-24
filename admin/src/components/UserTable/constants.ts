import {
  getCreatedAtFilter,
  getDateRangeFilter,
  getNumberRangeFilter,
  getSearchStringFilter,
} from '../Filters/constants';
import type { TFilters } from '../Filters/types';

export const filtersConfig: Array<TFilters> = [
  getSearchStringFilter({
    label: 'Name',
    name: 'name',
    placeholder: 'Veronika',
  }),
  getSearchStringFilter({
    label: 'Surname',
    name: 'surname',
    placeholder: 'Balakhonova',
  }),
  getDateRangeFilter({
    minName: 'min_birthdate',
    maxName: 'max_birthdate',
    label: 'Birthdate range',
  }),
  getCreatedAtFilter(),
  getNumberRangeFilter({
    minName: 'min_grade',
    maxName: 'max_grade',
    label: 'Grade range',
  }),
];
