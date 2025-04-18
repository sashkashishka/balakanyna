import type {
  IDateRangeFilter,
  ILabelSelectorFilter,
  INumberRangeFilter,
  ISearchStringFilter,
  ISelectFilter,
  ITaskTypesSelectorFilter,
  IUserSelectorFilter,
} from './types';

export function getDateRangeFilter({
  minName,
  maxName,
  label,
  disabled,
}: Omit<IDateRangeFilter, 'type'>): IDateRangeFilter {
  return {
    type: 'date-range',
    minName,
    maxName,
    label,
    disabled,
  };
}
export function getCreatedAtFilter() {
  return getDateRangeFilter({
    minName: 'min_created_at',
    maxName: 'max_created_at',
    label: 'Creation range',
  });
}

export function getUpdatedAtFilter() {
  return getDateRangeFilter({
    minName: 'min_updated_at',
    maxName: 'max_updated_at',
    label: 'Updating range',
  });
}

export function getUserSelectorFilter(
  {
    label = 'Users',
    name = 'userIds',
    maxCount = 50,
    placeholder,
    disabled,
  }: Partial<Omit<IUserSelectorFilter, 'type'>> = {
    label: 'Users',
    name: 'userIds',
    maxCount: 50,
  },
): IUserSelectorFilter {
  return {
    type: 'user-selector',
    label,
    name,
    maxCount,
    placeholder,
    disabled,
  };
}

export function getSearchStringFilter({
  label,
  name,
  placeholder,
  disabled,
}: Omit<ISearchStringFilter, 'type'>): ISearchStringFilter {
  return {
    type: 'search-string',
    label,
    name,
    disabled,
    placeholder,
  };
}

export function getNumberRangeFilter({
  minName,
  maxName,
  label,
  disabled,
}: Omit<INumberRangeFilter, 'type'>): INumberRangeFilter {
  return {
    type: 'number-range',
    minName,
    maxName,
    label,
    disabled,
  };
}

export function getSelectFilter({
  label,
  name,
  options,
  disabled,
}: Omit<ISelectFilter, 'type'>): ISelectFilter {
  return {
    type: 'select',
    label,
    name,
    options,
    disabled,
  };
}

export function getLabelSelectorFilter({
  label,
  name,
  labelType,
  placeholder,
  maxCount,
  disabled,
}: Omit<ILabelSelectorFilter, 'type'>): ILabelSelectorFilter {
  return {
    type: 'label-selector',
    label,
    labelType,
    name,
    placeholder,
    maxCount,
    disabled,
  };
}

export function getTaskTypesSelectorFilter({
  label,
  name,
  placeholder,
  maxCount,
}: Omit<ITaskTypesSelectorFilter, 'type'>): ITaskTypesSelectorFilter {
  return {
    type: 'task-types-selector',
    label,
    name,
    placeholder,
    maxCount,
  };
}
