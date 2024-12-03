import { type ReadableAtom } from 'nanostores';
import type { IPaginatorResponse } from 'shared/types';
import { createFetcherStore, createMutatorStore } from './_query';
import { type IFilters } from './_list-filter';
import type { ILabel } from 'shared/types/label';
import { getSearchParam } from '@/utils/network';

export interface ILabelListFilters extends IFilters {
  name?: string;
  type?: ILabel['type'];
}

export const defaultLabelListFilters: ILabelListFilters = {
  page: 1,
  order_by: 'updatedAt',
  dir: 'descend',
};

export const LABEL_KEYS = {
  list: 'label/list',
  getList(search: ReadableAtom<string>) {
    return [this.list, search];
  },
  label: 'label/get',
  getLabel(labelId: string | number) {
    return ['label/get', getSearchParam('id', labelId)];
  },
};

// list and item fetcher store fabrics
export function makeLabelsStore(search: ReadableAtom<string>) {
  const $labels = createFetcherStore<IPaginatorResponse<ILabel>>(
    LABEL_KEYS.getList(search),
  );
  return $labels;
}

export function makeLabelStore(labelId: string | number) {
  const $label = createFetcherStore<ILabel>(LABEL_KEYS.getLabel(labelId));

  return $label;
}

// mutators
export const $createLabel = createMutatorStore<ILabel>(
  async ({ data, invalidate }) => {
    const resp = await fetch('/api/admin/label/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(LABEL_KEYS.list) || k.startsWith(LABEL_KEYS.label),
    );

    return resp;
  },
);

export const $updateLabel = createMutatorStore<ILabel>(
  async ({ data, invalidate }) => {
    const resp = await fetch(`/api/admin/label/update?id=${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });

    invalidate(
      (k) => k.startsWith(LABEL_KEYS.list) || k.startsWith(LABEL_KEYS.label),
    );

    return resp;
  },
);
