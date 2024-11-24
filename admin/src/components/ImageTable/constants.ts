import {
  getCreatedAtFilter,
  getLabelSelectorFilter,
  getSearchStringFilter,
} from '../Filters/constants';
import type { TFilters } from '../Filters/types';

export const filename = getSearchStringFilter({
  label: 'Filename',
  name: 'filename',
  placeholder: 'cars',
});

export const label = getLabelSelectorFilter({
  label: 'Labels',
  name: 'label',
  maxCount: 50,
  labelType: 'image',
});

export const filtersConfig: Array<TFilters> = [
  filename,
  label,
  getCreatedAtFilter(),
];
