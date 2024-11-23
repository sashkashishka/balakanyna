import type { TFilters } from "../Filters/types";

export const name = {
  type: 'search-string',
  label: 'Name',
  name: 'name',
  placeholder: 'Program Veronika',
} as const;

export const userIds = {
  type: 'user-selector',
  label: 'Users',
  name: 'userIds',
  maxCount: 50,
} as const;

export const startDatetime = {
  type: 'date-range',
  minName: 'min_start_datetime',
  maxName: 'max_start_datetime',
  label: 'Start datetime range',
} as const;

export const expirationDatetime = {
  type: 'date-range',
  minName: 'min_expiration_datetime',
  maxName: 'max_expiration_datetime',
  label: 'Expiration datetime range',
} as const;

export const updatedAt = {
  type: 'date-range',
  minName: 'min_updated_at',
  maxName: 'max_updated_at',
  label: 'Updating range',
} as const;

export const createdAt = {
  type: 'date-range',
  minName: 'min_created_at',
  maxName: 'max_created_at',
  label: 'Creation range',
} as const;

export const filtersConfig: Array<TFilters> = [
  name,
  userIds,
  startDatetime,
  expirationDatetime,
  updatedAt,
  createdAt,
];
