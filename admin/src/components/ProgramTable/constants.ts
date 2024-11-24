import {
  getCreatedAtFilter,
  getDateRangeFilter,
  getSearchStringFilter,
  getUpdatedAtFilter,
  getUserSelectorFilter,
} from '../Filters/constants';
import type { TFilters } from '../Filters/types';

export const name = getSearchStringFilter({
  label: 'Name',
  name: 'name',
  placeholder: 'Program Veronika',
});

export const userIds = getUserSelectorFilter();

export const startDatetime = getDateRangeFilter({
  minName: 'min_start_datetime',
  maxName: 'max_start_datetime',
  label: 'Start datetime range',
});

export const expirationDatetime = getDateRangeFilter({
  minName: 'min_expiration_datetime',
  maxName: 'max_expiration_datetime',
  label: 'Expiration datetime range',
});

export const filtersConfig: Array<TFilters> = [
  name,
  userIds,
  startDatetime,
  expirationDatetime,
  getUpdatedAtFilter(),
  getCreatedAtFilter(),
];
